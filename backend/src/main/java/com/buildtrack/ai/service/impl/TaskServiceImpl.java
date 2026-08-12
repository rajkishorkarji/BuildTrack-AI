package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.dto.task.TaskCreateRequest;
import com.buildtrack.ai.dto.task.TaskProgressRequest;
import com.buildtrack.ai.dto.task.TaskResponse;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.ProjectAssignment;
import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.TaskRepository;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {
    private static final List<String> TASK_CREATORS = List.of("COMPANY_ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR");
    private static final List<String> ASSIGNABLE_ROLES = List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR", "WORKER");

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher domainEventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForUser(User user) {
        String role = primaryRole(user);
        List<TaskEntity> tasks;
        if ("SUPER_ADMIN".equals(role)) tasks = taskRepository.findAll();
        else if ("COMPANY_ADMIN".equals(role)) tasks = taskRepository.findByProjectCompanyId(user.getCompanyId());
        else tasks = taskRepository.findForAssignedProjects(user.getId());
        return tasks.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, user);
        return taskRepository.findByProjectId(projectId).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public TaskResponse createTask(TaskCreateRequest request, User actor) {
        String actorRole = primaryRole(actor);
        if (!TASK_CREATORS.contains(actorRole)) throw new BadRequestException("Your role cannot create tasks");
        Project project = projectRepository.findById(request.projectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, actor);

        TaskEntity task = new TaskEntity();
        task.setProject(project);
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setPriority(normalizePriority(request.priority()));
        task.setDueDate(request.dueDate());
        task.setStatus("TODO");
        task.setCompletionPercentage(0);
        task.setAssignedUser(resolveAssignee(project, request.assigneeUserId(), actor));

        TaskEntity saved = taskRepository.save(task);
        publish(saved, "TASK_CREATED", "Task created: " + saved.getTitle());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskProgress(Long taskId, TaskProgressRequest request, User actor) {
        TaskEntity task = taskRepository.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        assertTaskAccess(task, actor);
        if (request.progress() != null) {
            task.setCompletionPercentage(request.progress());
            if (request.progress() >= 100) task.setStatus("COMPLETED");
            else if (request.progress() > 0 && (task.getStatus() == null || "TODO".equals(task.getStatus()))) task.setStatus("IN_PROGRESS");
        }
        if (request.status() != null && !request.status().isBlank()) task.setStatus(normalizeStatus(request.status()));
        TaskEntity saved = taskRepository.save(task);
        publish(saved, "TASK_UPDATED", "Task updated: " + saved.getTitle());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public TaskResponse assignTask(Long taskId, Long assigneeUserId, User actor) {
        TaskEntity task = taskRepository.findById(taskId).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        String role = primaryRole(actor);
        if (!("SUPER_ADMIN".equals(role) || "COMPANY_ADMIN".equals(role) || "PROJECT_MANAGER".equals(role) || "SITE_ENGINEER".equals(role) || "CONTRACTOR".equals(role)))
            throw new BadRequestException("Your role cannot assign tasks");
        assertProjectAccess(task.getProject(), actor);
        task.setAssignedUser(resolveAssignee(task.getProject(), assigneeUserId, actor));
        TaskEntity saved = taskRepository.save(task);
        publish(saved, "TASK_ASSIGNED", "Task assigned: " + saved.getTitle());
        return toResponse(saved);
    }

    private User resolveAssignee(Project project, Long assigneeUserId, User actor) {
        if (assigneeUserId == null) return null;
        User assignee = userRepository.findById(assigneeUserId).orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));
        if (!project.getCompany().getId().equals(assignee.getCompanyId())) throw new BadRequestException("Assignee belongs to another company");
        String assigneeRole = primaryRole(assignee);
        if (!ASSIGNABLE_ROLES.contains(assigneeRole)) throw new BadRequestException("Only project personnel can be assigned to a task");
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), assignee.getId(), "ACTIVE"))
            throw new BadRequestException("Assignee must first be assigned to this project");
        return assignee;
    }

    private void assertProjectAccess(Project project, User user) {
        String role = primaryRole(user);
        if ("SUPER_ADMIN".equals(role)) return;
        if (user.getCompanyId() == null || !user.getCompanyId().equals(project.getCompany().getId())) throw new BadRequestException("Project belongs to another company");
        if ("COMPANY_ADMIN".equals(role)) return;
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), user.getId(), "ACTIVE")) throw new BadRequestException("You are not assigned to this project");
    }

    private void assertTaskAccess(TaskEntity task, User user) {
        String role = primaryRole(user);
        if ("SUPER_ADMIN".equals(role) || "COMPANY_ADMIN".equals(role)) { assertProjectAccess(task.getProject(), user); return; }
        if (task.getAssignedUser() != null && task.getAssignedUser().getId().equals(user.getId())) return;
        assertProjectAccess(task.getProject(), user);
    }

    private void publish(TaskEntity task, String event, String message) {
        Long companyId = task.getProject().getCompany().getId();
        realtimePublisher.publishForCompany(companyId, "tasks", event.toLowerCase(Locale.ROOT), task.getId());
        domainEventPublisher.publish(event, companyId, "system", "TASK", task.getId(), message);
    }

    private TaskResponse toResponse(TaskEntity t) {
        User a = t.getAssignedUser();
        return new TaskResponse(t.getId(), t.getProject().getId(), t.getProject().getName(), t.getTitle(), t.getDescription(), t.getStatus(), t.getPriority(), t.getCompletionPercentage(), t.getDueDate(), a == null ? null : a.getId(), a == null ? null : fullName(a), a == null ? null : primaryRole(a));
    }

    private String primaryRole(User u) { return u.getRoles().stream().findFirst().map(r -> r.getRoleName().toUpperCase(Locale.ROOT)).orElse(""); }
    private String fullName(User u) { return ((u.getFirstName() == null ? "" : u.getFirstName()) + " " + (u.getLastName() == null ? "" : u.getLastName())).trim(); }
    private String normalizePriority(String p) {
        if (p == null || p.isBlank()) return "MEDIUM";
        String n = p.trim().toUpperCase(Locale.ROOT);
        return List.of("LOW", "MEDIUM", "HIGH", "CRITICAL").contains(n) ? n : "MEDIUM";
    }
    private String normalizeStatus(String s) {
        String n = s.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        return List.of("TODO", "IN_PROGRESS", "REVIEW", "COMPLETED").contains(n) ? n : "TODO";
    }
}
