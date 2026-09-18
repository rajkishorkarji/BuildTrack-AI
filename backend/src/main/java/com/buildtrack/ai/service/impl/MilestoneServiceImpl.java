package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.milestone.MilestoneRequest;
import com.buildtrack.ai.dto.milestone.MilestoneResponse;
import com.buildtrack.ai.entity.Milestone;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.MilestoneRepository;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.TaskRepository;
import com.buildtrack.ai.service.MilestoneService;
import com.buildtrack.ai.service.RealtimePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl implements MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final RealtimePublisher realtimePublisher;

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> list(User user, Long projectId) {
        String role = role(user);
        List<Milestone> milestones;
        if ("SUPER_ADMIN".equals(role)) {
            milestones = projectId != null
                    ? milestoneRepository.findByProjectId(projectId)
                    : milestoneRepository.findAll();
        } else {
            if (user.getCompanyId() == null) throw new BadRequestException("User is not linked to a company");
            if (projectId != null) {
                Project project = projectRepository.findById(projectId)
                        .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
                assertProjectAccess(project, user);
                milestones = milestoneRepository.findByProjectId(projectId);
            } else {
                milestones = milestoneRepository.findByCompanyId(user.getCompanyId());
            }
        }
        return milestones.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public MilestoneResponse create(MilestoneRequest request, User actor) {
        String role = role(actor);
        if (!List.of("SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER").contains(role))
            throw new BadRequestException("Only Project Managers and Admins can create milestones");

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, actor);

        Milestone milestone = new Milestone();
        milestone.setProject(project);
        milestone.setTitle(request.title().trim());
        milestone.setPlannedStartDate(LocalDate.now());
        milestone.setPlannedEndDate(request.dueDate());
        milestone.setStatus("PLANNED");
        milestone.setCompletionPercentage(0);

        Milestone saved = milestoneRepository.save(milestone);
        realtimePublisher.publishForCompany(project.getCompany().getId(), "milestones", "milestone_created", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void autoComplete(Long milestoneId) {
        milestoneRepository.findById(milestoneId).ifPresent(milestone -> {
            List<TaskEntity> linked = taskRepository.findByMilestoneId(milestoneId);
            if (linked.isEmpty()) return;
            long total = linked.size();
            long completed = linked.stream().filter(t -> "COMPLETED".equals(t.getStatus())
                    || (t.getCompletionPercentage() != null && t.getCompletionPercentage() >= 100)).count();

            int pct = (int) Math.round(linked.stream()
                    .map(TaskEntity::getCompletionPercentage)
                    .filter(java.util.Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0));
            milestone.setCompletionPercentage(pct);

            if (completed == total || pct >= 100) {
                if (!"COMPLETED".equals(milestone.getStatus())) {
                    milestone.setStatus("COMPLETED");
                    milestone.setActualEndDate(LocalDate.now());
                    milestoneRepository.save(milestone);
                    realtimePublisher.publishForCompany(
                            milestone.getProject().getCompany().getId(), "milestones", "milestone_completed", milestone.getId());
                }
            } else if (pct > 0) {
                milestone.setStatus("IN_PROGRESS");
                milestoneRepository.save(milestone);
            } else {
                milestone.setStatus("PLANNED");
                milestoneRepository.save(milestone);
            }
        });
    }

    private void assertProjectAccess(Project project, User user) {
        String role = role(user);
        if ("SUPER_ADMIN".equals(role)) return;
        if (user.getCompanyId() == null || !user.getCompanyId().equals(project.getCompany().getId()))
            throw new BadRequestException("Project belongs to another company");
        if ("COMPANY_ADMIN".equals(role)) return;
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), user.getId(), "ACTIVE"))
            throw new BadRequestException("You are not assigned to this project");
    }

    private MilestoneResponse toResponse(Milestone m) {
        List<TaskEntity> linked = taskRepository.findByMilestoneId(m.getId());
        long total = linked.size();
        long completed = linked.stream().filter(t -> "COMPLETED".equals(t.getStatus())
                || (t.getCompletionPercentage() != null && t.getCompletionPercentage() >= 100)).count();
        int pct = total > 0 ? (int) Math.round((completed * 100.0) / total) : (m.getCompletionPercentage() != null ? m.getCompletionPercentage() : 0);
        return new MilestoneResponse(
                m.getId(),
                m.getProject().getId(),
                m.getProject().getName(),
                m.getTitle(),
                m.getPlannedEndDate(),
                m.getStatus(),
                pct,
                total,
                completed
        );
    }

    private String role(User u) {
        return u.getRoles().stream().findFirst()
                .map(r -> r.getRoleName().toUpperCase(Locale.ROOT)).orElse("");
    }
}
