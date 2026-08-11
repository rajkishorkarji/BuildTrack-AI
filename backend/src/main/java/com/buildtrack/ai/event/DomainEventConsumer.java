package com.buildtrack.ai.event;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.ProjectAssignment;
import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.entity.Material;
import com.buildtrack.ai.repository.*;
import com.buildtrack.ai.service.RealtimePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DomainEventConsumer {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaterialRepository materialRepository;
    private final RealtimePublisher realtimePublisher;

    @KafkaListener(topics = "${app.kafka.topic.domain-events}", groupId = "buildtrack-notifications")
    @Transactional
    public void handle(DomainEvent event) {
        if (event == null || event.companyId() == null) return;

        Long projectId = resolveProjectId(event);
        List<User> recipients = resolveRecipients(event, projectId);
        if (recipients.isEmpty()) return;

        Set<Long> seen = new HashSet<>();
        for (User recipient : recipients) {
            if (recipient == null || recipient.getId() == null || !seen.add(recipient.getId())) continue;
            if (event.actorEmail() != null && event.actorEmail().equalsIgnoreCase(recipient.getEmail())) {
                continue;
            }
            Notification saved = notificationRepository.save(Notification.builder()
                    .title(formatTitle(event.eventType()))
                    .message(event.message() == null ? "BuildTrack AI event received" : event.message())
                    .type(resolveType(event.eventType()))
                    .read(false)
                    .recipientEmail(recipient.getEmail())
                    .recipientUserId(recipient.getId())
                    .companyId(event.companyId())
                    .projectId(projectId)
                    .senderName("BuildTrack AI")
                    .build());

            realtimePublisher.publishToUser(recipient.getEmail(), "notifications", "created", saved);
        }
    }

    private List<User> resolveRecipients(DomainEvent event, Long projectId) {
        String type = event.eventType() == null ? "" : event.eventType().toUpperCase(Locale.ROOT);
        Map<Long, User> result = new LinkedHashMap<>();

        if (projectId != null) {
            assignmentRepository.findAssignments(projectId, "ACTIVE")
                    .stream()
                    .map(ProjectAssignment::getUser)
                    .filter(Objects::nonNull)
                    .forEach(u -> result.put(u.getId(), u));
        }

        List<User> companyAdmins = userRepository.findEnabledByCompanyAndRole(event.companyId(), "COMPANY_ADMIN");
        companyAdmins.forEach(u -> result.put(u.getId(), u));

        // Platform payment events belong to Company Admins.
        if (type.startsWith("PAYMENT_") || type.contains("RAZORPAY")) {
            return companyAdmins;
        }

        // Daily logs and reports are operationally relevant to managers/engineers/admins.
        if (type.startsWith("DAILY_LOG") || type.startsWith("REPORT_")) {
            addRole(result, event.companyId(), "PROJECT_MANAGER");
            addRole(result, event.companyId(), "SITE_ENGINEER");
        }

        // Equipment/material/attendance/task events should reach project participants.
        if (type.startsWith("EQUIPMENT_") || type.startsWith("MATERIAL_") || type.startsWith("ATTENDANCE_") || type.startsWith("TASK_")) {
            addRole(result, event.companyId(), "COMPANY_ADMIN");
        }

        // Project lifecycle events are relevant to the company management team.
        if (type.startsWith("PROJECT_")) {
            addRole(result, event.companyId(), "COMPANY_ADMIN");
        }

        return new ArrayList<>(result.values());
    }

    private void addRole(Map<Long, User> result, Long companyId, String role) {
        userRepository.findEnabledByCompanyAndRole(companyId, role)
                .forEach(u -> result.put(u.getId(), u));
    }

    private Long resolveProjectId(DomainEvent event) {
        if (event.entityId() == null || event.entityType() == null) return null;
        try {
            return switch (event.entityType().toUpperCase(Locale.ROOT)) {
                case "PROJECT" -> projectRepository.findById(event.entityId()).map(Project::getId).orElse(null);
                case "TASK" -> taskRepository.findById(event.entityId()).map(TaskEntity::getProject).map(Project::getId).orElse(null);
                case "ATTENDANCE" -> attendanceRepository.findById(event.entityId()).map(Attendance::getProject).map(Project::getId).orElse(null);
                case "EQUIPMENT" -> equipmentRepository.findById(event.entityId()).map(Equipment::getProject).map(Project::getId).orElse(null);
                case "MATERIAL" -> materialRepository.findById(event.entityId()).map(Material::getProject).map(Project::getId).orElse(null);
                default -> null;
            };
        } catch (Exception ex) {
            log.warn("Unable to resolve project for event {}: {}", event.eventType(), ex.getMessage());
            return null;
        }
    }

    private Notification.NotificationType resolveType(String eventType) {
        String type = eventType == null ? "" : eventType.toUpperCase(Locale.ROOT);
        if (type.contains("REJECT") || type.contains("FAILED") || type.contains("RISK")) return Notification.NotificationType.ALERT;
        if (type.contains("WARNING") || type.contains("LOW_STOCK") || type.contains("MAINTENANCE")) return Notification.NotificationType.WARNING;
        if (type.contains("COMPLETED") || type.contains("VERIFIED") || type.contains("PAID")) return Notification.NotificationType.SUCCESS;
        return Notification.NotificationType.INFO;
    }

    private String formatTitle(String eventType) {
        if (eventType == null || eventType.isBlank()) return "BuildTrack AI Update";
        return Arrays.stream(eventType.toLowerCase(Locale.ROOT).split("_"))
                .map(s -> s.isEmpty() ? s : Character.toUpperCase(s.charAt(0)) + s.substring(1))
                .collect(Collectors.joining(" "));
    }
}
