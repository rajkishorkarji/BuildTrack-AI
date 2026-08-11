package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.attendance.AttendanceQrCheckInRequest;
import com.buildtrack.ai.dto.attendance.AttendanceRequest;
import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.Worker;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.AttendanceRepository;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.WorkerRepository;
import com.buildtrack.ai.service.AttendanceService;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher domainEventPublisher;
    private final TenantAccessService tenantAccessService;

    @Override
    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceForUser(User user) {
        String role = primaryRole(user);
        if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
            return attendanceRepository.findAll();
        }
        if (user.getCompanyId() == null) return List.of();
        if ("COMPANY_ADMIN".equalsIgnoreCase(role) || "SITE_ENGINEER".equalsIgnoreCase(role) || "PROJECT_MANAGER".equalsIgnoreCase(role)) {
            return attendanceRepository.findByProjectCompanyIdOrderByCheckInDesc(user.getCompanyId());
        }
        if ("WORKER".equalsIgnoreCase(role)) {
            Worker worker = workerRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Worker profile is not linked to this account"));
            return attendanceRepository.findByWorkerIdOrderByCheckInDesc(worker.getId());
        }
        List<Project> projects = assignmentRepository.findProjectsForUser(user.getId(), "ACTIVE");
        return projects.stream()
                .flatMap(project -> attendanceRepository.findByProjectIdOrderByCheckInDesc(project.getId()).stream())
                .toList();
    }

    @Override
    @Transactional
    public Attendance checkIn(AttendanceRequest request, User actor) {
        Worker worker;
        if (request.getWorkerId() == null && "WORKER".equalsIgnoreCase(primaryRole(actor))) {
            worker = workerRepository.findByUserId(actor.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Worker profile is not linked to this account"));
        } else {
            if (request.getWorkerId() == null) throw new BadRequestException("Worker is required");
            worker = workerRepository.findById(request.getWorkerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        }
        assertWorkerTenant(worker, actor);
        Project project = resolveProject(request.getProjectId(), worker, actor);
        assertCanManageAttendance(actor, project, worker);
        return createCheckIn(worker, project, request.getStatus(), actor);
    }

    @Override
    @Transactional
    public Attendance checkInByQr(AttendanceQrCheckInRequest request, User actor) {
        Worker worker = workerRepository.findByQrCodeToken(request.getQrCodeToken().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid worker QR code"));
        assertWorkerTenant(worker, actor);
        Project project = resolveProject(request.getProjectId(), worker, actor);
        if ("WORKER".equalsIgnoreCase(primaryRole(actor))) {
            if (worker.getUser() == null || !worker.getUser().getId().equals(actor.getId())) {
                throw new BadRequestException("A worker can only use their own attendance QR code");
            }
        } else {
            assertCanManageAttendance(actor, project, worker);
        }
        return createCheckIn(worker, project, null, actor);
    }

    private Attendance createCheckIn(Worker worker, Project project, String requestedStatus, User actor) {
        if (worker.getStatus() != Worker.WorkerStatus.ACTIVE) {
            throw new BadRequestException("Only an active worker can check in");
        }
        if (project == null) throw new BadRequestException("A project is required for attendance");
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), worker.getUser() == null ? -1L : worker.getUser().getId(), "ACTIVE")) {
            // Legacy worker records may not yet be linked to a user. In that case the explicit worker project is enough.
            if (worker.getAssignedProject() == null || !project.getId().equals(worker.getAssignedProject().getId())) {
                throw new BadRequestException("Worker is not assigned to this project");
            }
        }
        attendanceRepository.findOpenByWorkerId(worker.getId()).ifPresent(existing -> {
            throw new BadRequestException("Worker already has an open attendance session");
        });
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.atStartOfDay();
        LocalDateTime to = today.plusDays(1).atStartOfDay();
        if (!attendanceRepository.findWorkerForDay(worker.getId(), from, to).isEmpty()) {
            throw new BadRequestException("Attendance is already recorded for this worker today");
        }
        Attendance.AttendanceStatus status = parseStatus(requestedStatus);
        Attendance saved = attendanceRepository.save(Attendance.builder()
                .worker(worker)
                .project(project)
                .checkIn(LocalDateTime.now())
                .status(status)
                .verificationStatus("PENDING")
                .build());
        publish(saved, actor, "ATTENDANCE_CHECKED_IN", "Attendance checked in");
        return saved;
    }

    @Override
    @Transactional
    public Attendance checkOutWorker(Long attendanceId, User actor) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        assertAttendanceAccess(attendance, actor, false);
        if (attendance.getCheckOut() != null) throw new BadRequestException("Attendance is already checked out");
        LocalDateTime checkout = LocalDateTime.now();
        attendance.setCheckOut(checkout);
        long minutes = Math.max(0, Duration.between(attendance.getCheckIn(), checkout).toMinutes());
        attendance.setHoursWorked(BigDecimal.valueOf(minutes / 60.0).setScale(2, RoundingMode.HALF_UP));
        if (minutes > 8 * 60) attendance.setStatus(Attendance.AttendanceStatus.OVERTIME);
        Attendance saved = attendanceRepository.save(attendance);
        publish(saved, actor, "ATTENDANCE_CHECKED_OUT", "Attendance checked out");
        return saved;
    }

    @Override
    @Transactional
    public Attendance verifyAttendance(Long attendanceId, boolean verified, User actor) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        assertAttendanceAccess(attendance, actor, true);
        if (!canVerify(actor)) throw new BadRequestException("Only Company Admin, Project Manager or Site Engineer can verify attendance");
        attendance.setVerificationStatus(verified ? "VERIFIED" : "REJECTED");
        attendance.setVerifiedBy(actor.getEmail());
        Attendance saved = attendanceRepository.save(attendance);
        publish(saved, actor, verified ? "ATTENDANCE_VERIFIED" : "ATTENDANCE_REJECTED", verified ? "Attendance verified" : "Attendance rejected");
        return saved;
    }

    private Project resolveProject(Long requestedProjectId, Worker worker, User actor) {
        Long projectId = requestedProjectId;
        if (projectId == null && worker.getAssignedProject() != null) projectId = worker.getAssignedProject().getId();
        if (projectId == null) throw new BadRequestException("Project is required");
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (actor.getCompanyId() != null && !actor.getCompanyId().equals(project.getCompany().getId())) throw new BadRequestException("Project belongs to another company");
        return project;
    }

    private void assertCanManageAttendance(User actor, Project project, Worker worker) {
        String role = primaryRole(actor);
        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "COMPANY_ADMIN".equalsIgnoreCase(role)) return;
        if ("WORKER".equalsIgnoreCase(role)) {
            if (worker.getUser() == null || !worker.getUser().getId().equals(actor.getId())) throw new BadRequestException("Worker can only manage own attendance");
            return;
        }
        if (!List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR").contains(role.toUpperCase())) throw new BadRequestException("You cannot mark attendance");
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), actor.getId(), "ACTIVE")) throw new BadRequestException("You are not assigned to this project");
    }

    private void assertAttendanceAccess(Attendance attendance, User actor, boolean verification) {
        Worker worker = attendance.getWorker();
        Project project = attendance.getProject();
        if (actor.getCompanyId() == null || worker.getCompanyId() == null || !actor.getCompanyId().equals(worker.getCompanyId())) throw new BadRequestException("Attendance belongs to another company");
        String role = primaryRole(actor);
        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "COMPANY_ADMIN".equalsIgnoreCase(role) || "SITE_ENGINEER".equalsIgnoreCase(role) || "PROJECT_MANAGER".equalsIgnoreCase(role)) return;
        if (worker.getUser() != null && worker.getUser().getId().equals(actor.getId())) return;
        if (project != null && assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), actor.getId(), "ACTIVE")) return;
        throw new BadRequestException("You do not have access to this attendance record");
    }

    private boolean canVerify(User user) {
        String role = primaryRole(user);
        return List.of("SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER").contains(role.toUpperCase());
    }

    private void assertWorkerTenant(Worker worker, User actor) {
        if (actor.getCompanyId() == null || worker.getCompanyId() == null || !actor.getCompanyId().equals(worker.getCompanyId())) throw new BadRequestException("Worker belongs to another company");
    }

    private Attendance.AttendanceStatus parseStatus(String value) {
        if (value == null || value.isBlank()) return Attendance.AttendanceStatus.PRESENT;
        try { return Attendance.AttendanceStatus.valueOf(value.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { throw new BadRequestException("Invalid attendance status"); }
    }

    private void publish(Attendance attendance, User actor, String eventType, String message) {
        Long companyId = actor.getCompanyId();
        realtimePublisher.publishForCompany(companyId, "attendance", eventType.toLowerCase(), attendance.getId());
        domainEventPublisher.publish(eventType, companyId, actor.getEmail(), "ATTENDANCE", attendance.getId(), message);
    }

    private String primaryRole(User user) { return user.getRoles().stream().findFirst().map(r -> r.getRoleName()).orElse(""); }
}
