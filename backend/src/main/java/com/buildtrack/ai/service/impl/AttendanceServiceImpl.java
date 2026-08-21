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
    @Transactional
    public List<Attendance> getAttendanceForUser(User user) {
        String role = primaryRole(user);
        if ("SUPER_ADMIN".equalsIgnoreCase(role)) {
            return attendanceRepository.findAll();
        }
        if (user.getCompanyId() == null) return List.of();
        if ("COMPANY_ADMIN".equalsIgnoreCase(role) || "SITE_ENGINEER".equalsIgnoreCase(role) || "PROJECT_MANAGER".equalsIgnoreCase(role) || "CONTRACTOR".equalsIgnoreCase(role)) {
            return attendanceRepository.findByProjectCompanyIdOrderByCheckInDesc(user.getCompanyId());
        }
        if ("WORKER".equalsIgnoreCase(role)) {
            Worker worker = workerRepository.findByUserId(user.getId())
                    .orElseGet(() -> autoCreateOrLinkWorkerForUser(user));
            return attendanceRepository.findByWorkerIdOrderByCheckInDesc(worker.getId());
        }
        return attendanceRepository.findByProjectCompanyIdOrderByCheckInDesc(user.getCompanyId());
    }

    @Override
    @Transactional
    public Attendance checkIn(AttendanceRequest request, User actor) {
        Worker worker;
        if (request.getWorkerId() == null && "WORKER".equalsIgnoreCase(primaryRole(actor))) {
            worker = workerRepository.findByUserId(actor.getId())
                    .orElseGet(() -> autoCreateOrLinkWorkerForUser(actor));
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
        String token = request.getQrCodeToken() != null ? request.getQrCodeToken().trim() : "";
        Worker worker = workerRepository.findByQrCodeToken(token)
                .or(() -> {
                    try {
                        Long id = Long.parseLong(token);
                        return workerRepository.findById(id);
                    } catch (Exception e) {
                        return java.util.Optional.empty();
                    }
                })
                .orElseGet(() -> {
                    if ("WORKER".equalsIgnoreCase(primaryRole(actor))) {
                        return autoCreateOrLinkWorkerForUser(actor);
                    }
                    throw new ResourceNotFoundException("Invalid worker QR code token");
                });
        assertWorkerTenant(worker, actor);
        Project project = resolveProject(request.getProjectId(), worker, actor);
        if ("WORKER".equalsIgnoreCase(primaryRole(actor))) {
            if (worker.getUser() != null && !worker.getUser().getId().equals(actor.getId())) {
                throw new BadRequestException("A worker can only use their own attendance QR code");
            }
        } else {
            assertCanManageAttendance(actor, project, worker);
        }
        return createCheckIn(worker, project, null, actor);
    }

    private Attendance createCheckIn(Worker worker, Project project, String requestedStatus, User actor) {
        if (worker.getStatus() != Worker.WorkerStatus.ACTIVE) {
            worker.setStatus(Worker.WorkerStatus.ACTIVE);
            workerRepository.save(worker);
        }
        if (project == null) throw new BadRequestException("A project is required for attendance");

        attendanceRepository.findOpenByWorkerId(worker.getId()).ifPresent(existing -> {
            throw new BadRequestException("Worker already has an open attendance session. Please check out first.");
        });

        Attendance.AttendanceStatus status = parseStatus(requestedStatus);
        Attendance saved = attendanceRepository.save(Attendance.builder()
                .worker(worker)
                .project(project)
                .checkIn(LocalDateTime.now())
                .status(status)
                .verificationStatus("PENDING")
                .build());
        publish(saved, actor, "ATTENDANCE_CHECKED_IN", "Attendance session OPEN");
        return saved;
    }

    @Override
    @Transactional
    public Attendance checkOutWorker(Long attendanceId, User actor) {
        Attendance attendance = null;
        if (attendanceId != null && attendanceId > 0) {
            attendance = attendanceRepository.findById(attendanceId).orElse(null);
        }
        if (attendance == null && "WORKER".equalsIgnoreCase(primaryRole(actor))) {
            Worker worker = workerRepository.findByUserId(actor.getId()).orElse(null);
            if (worker != null) {
                attendance = attendanceRepository.findOpenByWorkerId(worker.getId()).orElse(null);
            }
        }
        if (attendance == null) {
            throw new ResourceNotFoundException("No active attendance record found to check out");
        }
        assertAttendanceAccess(attendance, actor, false);
        if (attendance.getCheckOut() != null) throw new BadRequestException("Attendance is already checked out");
        LocalDateTime checkout = LocalDateTime.now();
        attendance.setCheckOut(checkout);
        long minutes = Math.max(0, Duration.between(attendance.getCheckIn(), checkout).toMinutes());
        BigDecimal hours = BigDecimal.valueOf(minutes / 60.0).setScale(2, RoundingMode.HALF_UP);
        attendance.setHoursWorked(hours);
        if (hours.compareTo(BigDecimal.valueOf(8.0)) > 0) {
            attendance.setStatus(Attendance.AttendanceStatus.OVERTIME);
        } else {
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        }
        Attendance saved = attendanceRepository.save(attendance);
        String category = hours.doubleValue() > 8.0 ? "Overtime (" + hours + " hrs)"
                : (hours.doubleValue() >= 7.95 && hours.doubleValue() <= 8.05 ? "Full Day Completed (8.0 hrs)"
                : "Early Leave (" + hours + " hrs)");
        publish(saved, actor, "ATTENDANCE_CHECKED_OUT", "Attendance checked out: " + category);
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

    private Worker autoCreateOrLinkWorkerForUser(User actor) {
        if (actor.getCompanyId() != null) {
            List<Worker> companyWorkers = workerRepository.findByCompanyId(actor.getCompanyId());
            for (Worker w : companyWorkers) {
                if (w.getUser() == null && (
                        (w.getFullName() != null && w.getFullName().equalsIgnoreCase(actor.getFullName())) ||
                        (w.getPhone() != null && w.getPhone().equals(actor.getPhone()))
                )) {
                    w.setUser(actor);
                    return workerRepository.save(w);
                }
            }
        }
        String qrToken = "QR-WRK-" + String.format("%05d", actor.getId());
        Worker newWorker = Worker.builder()
                .fullName(actor.getFullName() != null ? actor.getFullName() : actor.getEmail())
                .phone(actor.getPhone() != null ? actor.getPhone() : "")
                .skillTrade("General Worker")
                .dailyWage(BigDecimal.ZERO)
                .qrCodeToken(qrToken)
                .status(Worker.WorkerStatus.ACTIVE)
                .companyId(actor.getCompanyId())
                .user(actor)
                .assignmentType("DIRECT_PROJECT")
                .build();
        return workerRepository.save(newWorker);
    }

    private Project resolveProject(Long requestedProjectId, Worker worker, User actor) {
        Long projectId = requestedProjectId;
        if (projectId == null && worker.getAssignedProject() != null) projectId = worker.getAssignedProject().getId();
        if (projectId == null) {
            List<Project> activeProjects = assignmentRepository.findProjectsForUser(actor.getId(), "ACTIVE");
            if (!activeProjects.isEmpty()) {
                projectId = activeProjects.get(0).getId();
            } else if (actor.getCompanyId() != null) {
                List<Project> companyProjects = projectRepository.findByCompanyId(actor.getCompanyId());
                if (!companyProjects.isEmpty()) {
                    projectId = companyProjects.get(0).getId();
                }
            }
        }
        if (projectId == null) throw new BadRequestException("Project is required");
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (actor.getCompanyId() != null && project.getCompany() != null && !actor.getCompanyId().equals(project.getCompany().getId())) {
            throw new BadRequestException("Project belongs to another company");
        }
        return project;
    }

    private void assertCanManageAttendance(User actor, Project project, Worker worker) {
        String role = primaryRole(actor);
        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "COMPANY_ADMIN".equalsIgnoreCase(role)) return;
        if ("WORKER".equalsIgnoreCase(role)) {
            if (worker.getUser() == null) {
                worker.setUser(actor);
                workerRepository.save(worker);
            }
            return;
        }
        if (!List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR").contains(role.toUpperCase())) throw new BadRequestException("You cannot mark attendance");
    }

    private void assertAttendanceAccess(Attendance attendance, User actor, boolean verification) {
        Worker worker = attendance.getWorker();
        Project project = attendance.getProject();
        if (actor.getCompanyId() != null && worker.getCompanyId() != null && !actor.getCompanyId().equals(worker.getCompanyId())) throw new BadRequestException("Attendance belongs to another company");
        String role = primaryRole(actor);
        if ("SUPER_ADMIN".equalsIgnoreCase(role) || "COMPANY_ADMIN".equalsIgnoreCase(role) || "SITE_ENGINEER".equalsIgnoreCase(role) || "PROJECT_MANAGER".equalsIgnoreCase(role) || "CONTRACTOR".equalsIgnoreCase(role)) return;
        if (worker.getUser() != null && worker.getUser().getId().equals(actor.getId())) return;
        if (project != null && assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), actor.getId(), "ACTIVE")) return;
        throw new BadRequestException("You do not have access to this attendance record");
    }

    private boolean canVerify(User user) {
        String role = primaryRole(user);
        return List.of("SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER").contains(role.toUpperCase());
    }

    private void assertWorkerTenant(Worker worker, User actor) {
        if (actor.getCompanyId() != null && worker.getCompanyId() != null && !actor.getCompanyId().equals(worker.getCompanyId())) throw new BadRequestException("Worker belongs to another company");
        if (worker.getCompanyId() == null && actor.getCompanyId() != null) {
            worker.setCompanyId(actor.getCompanyId());
            workerRepository.save(worker);
        }
    }

    private Attendance.AttendanceStatus parseStatus(String value) {
        if (value == null || value.isBlank()) return Attendance.AttendanceStatus.PRESENT;
        try { return Attendance.AttendanceStatus.valueOf(value.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { throw new BadRequestException("Invalid attendance status"); }
    }

    private void publish(Attendance attendance, User actor, String eventType, String message) {
        Long companyId = actor.getCompanyId();
        if (companyId != null) {
            realtimePublisher.publishForCompany(companyId, "attendance", eventType.toLowerCase(), attendance.getId());
            domainEventPublisher.publish(eventType, companyId, actor.getEmail(), "ATTENDANCE", attendance.getId(), message);
        }
    }

    private String primaryRole(User user) { return user.getRoles().stream().findFirst().map(r -> r.getRoleName()).orElse(""); }
}
