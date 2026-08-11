package com.buildtrack.ai.event;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.entity.*;
import com.buildtrack.ai.repository.*;
import com.buildtrack.ai.service.AiInsightService;
import com.buildtrack.ai.service.RealtimePublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiEventConsumer {

    private final AiInsightService aiInsightService;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaterialRepository materialRepository;
    private final DailyLogRepository dailyLogRepository;
    private final UserRepository userRepository;
    private final RealtimePublisher realtimePublisher;

    @KafkaListener(
            topics = "${app.kafka.topic.domain-events}",
            groupId = "buildtrack-ai-analysis")
    public void handle(DomainEvent event) {
        if (!shouldAnalyze(event)) return;

        Long projectId = resolveProjectId(event);
        if (projectId == null) return;

        try {
            Project project = projectRepository.findById(projectId).orElse(null);
            if (project == null || project.getCompany() == null) return;

            User actor = event.actorEmail() == null
                    ? null
                    : userRepository.findByEmail(event.actorEmail()).orElse(null);

            if (actor == null || actor.getCompanyId() == null ||
                    !actor.getCompanyId().equals(project.getCompany().getId())) {
                actor = userRepository.findByCompanyIdAndEnabledTrue(project.getCompany().getId())
                        .stream().findFirst().orElse(null);
            }

            if (actor == null) return;

            Map<String, Object> diagnostics =
                    aiInsightService.runProjectDiagnostics(projectId, actor);

            realtimePublisher.publishForCompany(
                    project.getCompany().getId(),
                    "ai",
                    "diagnostics_updated",
                    diagnostics);
        } catch (Exception ex) {
            log.warn("AI event analysis failed for {}: {}", event.eventType(), ex.getMessage());
        }
    }

    private boolean shouldAnalyze(DomainEvent event) {
        if (event == null || event.eventType() == null) return false;
        String type = event.eventType().toUpperCase(Locale.ROOT);
        return type.startsWith("PROJECT_")
                || type.startsWith("TASK_")
                || type.startsWith("ATTENDANCE_")
                || type.startsWith("EQUIPMENT_")
                || type.startsWith("MATERIAL_")
                || type.startsWith("DAILY_LOG_");
    }

    private Long resolveProjectId(DomainEvent event) {
        if (event.entityId() == null || event.entityType() == null) return null;

        return switch (event.entityType().toUpperCase(Locale.ROOT)) {
            case "PROJECT" -> event.entityId();
            case "TASK" -> taskRepository.findById(event.entityId())
                    .map(TaskEntity::getProject).map(Project::getId).orElse(null);
            case "ATTENDANCE" -> attendanceRepository.findById(event.entityId())
                    .map(Attendance::getProject).map(Project::getId).orElse(null);
            case "EQUIPMENT" -> equipmentRepository.findById(event.entityId())
                    .map(Equipment::getProject).map(Project::getId).orElse(null);
            case "MATERIAL" -> materialRepository.findById(event.entityId())
                    .map(Material::getProject).map(Project::getId).orElse(null);
            case "DAILY_LOG" -> dailyLogRepository.findById(event.entityId())
                    .map(DailyLog::getProject).map(Project::getId).orElse(null);
            default -> null;
        };
    }
}
