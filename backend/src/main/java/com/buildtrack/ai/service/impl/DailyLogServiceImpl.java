package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.dailylog.DailyLogRequest;
import com.buildtrack.ai.dto.dailylog.DailyLogResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.DailyLog;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.DailyLogRepository;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.service.DailyLogService;
import com.buildtrack.ai.service.RealtimePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DailyLogServiceImpl implements DailyLogService {
    private final DailyLogRepository dailyLogRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher domainEventPublisher;

    @Override @Transactional(readOnly = true)
    public List<DailyLogResponse> getLogs(User user, Long projectId) {
        String role = role(user);
        List<DailyLog> logs;
        if ("SUPER_ADMIN".equals(role)) {
            logs = projectId == null ? dailyLogRepository.findAll() : dailyLogRepository.findByProjectIdOrderByLogDateDescCreatedAtDesc(projectId);
        } else {
            if (user.getCompanyId() == null) throw new BadRequestException("User is not linked to a company");
            if (projectId != null) {
                Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                assertProjectAccess(project, user);
                logs = dailyLogRepository.findByProjectCompanyIdAndProjectIdOrderByLogDateDescCreatedAtDesc(user.getCompanyId(), projectId);
            } else if ("WORKER".equals(role)) {
                logs = dailyLogRepository.findByCompanyIdOrderByLogDateDescCreatedAtDesc(user.getCompanyId()).stream()
                    .filter(l -> l.getCreatedBy().getId().equals(user.getId()) || assignmentRepository.existsByProjectIdAndUserIdAndStatus(l.getProject().getId(), user.getId(), "ACTIVE"))
                    .toList();
            } else {
                logs = dailyLogRepository.findByCompanyIdOrderByLogDateDescCreatedAtDesc(user.getCompanyId());
            }
        }
        return logs.stream().map(this::toResponse).toList();
    }

    @Override @Transactional
    public DailyLogResponse create(DailyLogRequest request, User user) {
        String role = role(user);
        if (!List.of("COMPANY_ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR").contains(role))
            throw new BadRequestException("Your role cannot submit daily logs");
        Project project = projectRepository.findById(request.projectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, user);
        Company company = project.getCompany();
        DailyLog log = DailyLog.builder().company(company).project(project).createdBy(user)
            .logDate(request.logDate()).workSummary(request.workSummary().trim()).blockers(request.blockers())
            .safetyNotes(request.safetyNotes()).weather(request.weather())
            .progressPercentage(request.progressPercentage()).status("SUBMITTED").build();
        DailyLog saved = dailyLogRepository.save(log);

        if (request.progressPercentage() != null) {
            project.setProgressPercentage(request.progressPercentage());
            projectRepository.save(project);
        }

        publish(saved, "DAILY_LOG_CREATED", "Daily log submitted for " + project.getName());
        return toResponse(saved);
    }

    @Override @Transactional
    public DailyLogResponse approve(Long id, User user) { return changeStatus(id, user, "APPROVED"); }
    @Override @Transactional
    public DailyLogResponse reject(Long id, User user) { return changeStatus(id, user, "REJECTED"); }

    private DailyLogResponse changeStatus(Long id, User user, String status) {
        DailyLog log = dailyLogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Daily log not found"));
        String role = role(user);
        if (!List.of("SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER").contains(role)) throw new BadRequestException("Your role cannot review daily logs");
        assertProjectAccess(log.getProject(), user);
        log.setStatus(status);
        DailyLog saved = dailyLogRepository.save(log);
        publish(saved, "DAILY_LOG_" + status, "Daily log " + status.toLowerCase(Locale.ROOT));
        return toResponse(saved);
    }

    private void assertProjectAccess(Project project, User user) {
        String role = role(user);
        if ("SUPER_ADMIN".equals(role)) return;
        if (user.getCompanyId() == null || !user.getCompanyId().equals(project.getCompany().getId())) throw new BadRequestException("Project belongs to another company");
        if ("COMPANY_ADMIN".equals(role)) return;
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), user.getId(), "ACTIVE")) throw new BadRequestException("You are not assigned to this project");
    }
    private void publish(DailyLog log, String event, String message) {
        Long companyId = log.getCompany().getId();
        realtimePublisher.publishForCompany(companyId, "reports", event.toLowerCase(Locale.ROOT), log.getId());
        realtimePublisher.publishForCompany(companyId, "projects", "project_updated", log.getProject().getId());
        domainEventPublisher.publish(event, companyId, "system", "DAILY_LOG", log.getId(), message);
    }
    private DailyLogResponse toResponse(DailyLog l) {
        User u = l.getCreatedBy();
        String name = ((u.getFirstName() == null ? "" : u.getFirstName()) + " " + (u.getLastName() == null ? "" : u.getLastName())).trim();
        return new DailyLogResponse(l.getId(), l.getProject().getId(), l.getProject().getName(), u.getId(), name, l.getLogDate(), l.getWorkSummary(), l.getBlockers(), l.getSafetyNotes(), l.getWeather(), l.getProgressPercentage(), l.getStatus(), l.getCreatedAt());
    }
    private String role(User u) { return u.getRoles().stream().findFirst().map(r -> r.getRoleName().toUpperCase(Locale.ROOT)).orElse(""); }
}
