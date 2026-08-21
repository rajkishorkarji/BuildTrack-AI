package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.project.*;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.ProjectAssignment;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projectService;
    private final TenantAccessService tenantAccessService;
    private final RealtimePublisher realtimePublisher;
    private final com.buildtrack.ai.event.DomainEventPublisher domainEventPublisher;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ProjectSummaryResponse>>> getProjects() {
        User user = tenantAccessService.currentUser();
        List<ProjectSummaryResponse> result = projectService.getProjectsForUser(user).stream().map(this::summary).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ProjectSummaryResponse>> getProject(@PathVariable Long id) {
        User user = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(summary(projectService.getProjectForUser(id, user))));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectSummaryResponse>> create(@Valid @RequestBody ProjectCreateRequest request) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        var company = tenantAccessService.currentCompany();
        tenantAccessService.requireActiveSubscription(company);
        Project project = projectService.create(company.getId(), request);
        realtimePublisher.publishForCompany(project.getCompany().getId(), "projects", "created", project.getId());
        domainEventPublisher.publish("PROJECT_CREATED", project.getCompany().getId(), userEmail(), "PROJECT", project.getId(), "Project created: " + project.getName());
        return ResponseEntity.ok(ApiResponse.success(summary(project)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectSummaryResponse>> update(@PathVariable Long id, @Valid @RequestBody ProjectCreateRequest request) {
        User user = tenantAccessService.currentUser();
        Project project = projectService.update(id, request, user);
        realtimePublisher.publishForCompany(project.getCompany().getId(), "projects", "updated", project.getId());
        domainEventPublisher.publish("PROJECT_UPDATED", project.getCompany().getId(), userEmail(), "PROJECT", project.getId(), "Project updated: " + project.getName());
        return ResponseEntity.ok(ApiResponse.success(summary(project)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User user = tenantAccessService.currentUser();
        Project existing = projectService.getProjectForUser(id, user);
        Long companyId = existing.getCompany().getId();
        projectService.delete(id, user);
        realtimePublisher.publishForCompany(companyId, "projects", "deleted", id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<ApiResponse<List<ProjectAssignmentResponse>>> assignments(@PathVariable Long id) {
        User user = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(projectService.assignments(id, user).stream().map(this::assignment).toList()));
    }

    @PostMapping("/{id}/assignments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<ProjectAssignmentResponse>> assign(@PathVariable Long id, @Valid @RequestBody ProjectAssignmentRequest request) {
        User actor = tenantAccessService.currentUser();
        ProjectAssignment a = projectService.assign(id, request.getUserId(), request.getRole(), actor);
        realtimePublisher.publishForCompany(a.getProject().getCompany().getId(), "projects", "assignment-created", id);
        domainEventPublisher.publish("PROJECT_ASSIGNMENT_CREATED", a.getProject().getCompany().getId(), userEmail(), "PROJECT", id, "Project personnel assigned");
        return ResponseEntity.ok(ApiResponse.success(assignment(a)));
    }

    @DeleteMapping("/{id}/assignments/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unassign(@PathVariable Long id, @PathVariable Long userId) {
        User actor = tenantAccessService.currentUser();
        projectService.unassign(id, userId, actor);
        realtimePublisher.publishForCompany(tenantAccessService.currentCompany().getId(), "projects", "assignment-removed", id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectSummaryResponse>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = tenantAccessService.currentUser();
        Project project = projectService.getProjectForUser(id, user);
        String newStatus = body.getOrDefault("status", project.getStatus());
        com.buildtrack.ai.dto.project.ProjectCreateRequest req = new com.buildtrack.ai.dto.project.ProjectCreateRequest();
        req.setName(project.getName());
        req.setCode(project.getCode());
        req.setLocation(project.getLocation());
        req.setDescription(project.getDescription());
        req.setBudget(project.getBudget() != null ? project.getBudget() : java.math.BigDecimal.ZERO);
        req.setStartDate(project.getStartDate());
        req.setEstEndDate(project.getEstEndDate());
        req.setStatus(newStatus);
        Project updated = projectService.update(id, req, user);
        realtimePublisher.publishForCompany(updated.getCompany().getId(), "projects", "updated", updated.getId());
        domainEventPublisher.publish("PROJECT_STATUS_UPDATED", updated.getCompany().getId(), userEmail(), "PROJECT", updated.getId(), "Project status changed to " + newStatus);
        return ResponseEntity.ok(ApiResponse.success(summary(updated)));
    }

    @PatchMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<ProjectSummaryResponse>> updateOverallProgress(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = tenantAccessService.currentUser();
        Object val = body.get("progressPercentage");
        if (val == null) val = body.get("progress");
        Integer prog = val == null ? 0 : Integer.parseInt(val.toString());
        Project updated = projectService.updateProgress(id, prog, user);
        realtimePublisher.publishForCompany(updated.getCompany().getId(), "projects", "updated", updated.getId());
        domainEventPublisher.publish("PROJECT_PROGRESS_UPDATED", updated.getCompany().getId(), userEmail(), "PROJECT", updated.getId(), "Project overall progress updated to " + prog + "%");
        return ResponseEntity.ok(ApiResponse.success(summary(updated)));
    }

    @GetMapping("/eligible-users")
    public ResponseEntity<ApiResponse<List<EligibleUserResponse>>> eligibleUsers(@RequestParam String role) {
        User actor = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(actor);
        return ResponseEntity.ok(ApiResponse.success(projectService.eligibleUsers(tenantAccessService.currentCompany().getId(), role).stream()
                .map(u -> new EligibleUserResponse(u.getId(), (u.getFirstName()+" "+u.getLastName()).trim(), u.getEmail(), role.toUpperCase())).toList()));
    }

    private String userEmail() { return tenantAccessService.currentUser().getEmail(); }

    private ProjectSummaryResponse summary(Project p) {
        List<ProjectAssignmentResponse> assignments = projectService.assignments(p.getId(), tenantAccessService.currentUser()).stream().map(this::assignment).toList();
        String pmName = assignments.stream()
                .filter(a -> "PROJECT_MANAGER".equalsIgnoreCase(a.role()))
                .map(ProjectAssignmentResponse::fullName)
                .findFirst()
                .orElse(null);
        Long companyId = p.getCompany() != null ? p.getCompany().getId() : null;
        String companyName = p.getCompany() != null ? p.getCompany().getName() : null;

        return new ProjectSummaryResponse(
                p.getId(), p.getName(), p.getCode(), p.getLocation(), p.getDescription(),
                p.getBudget(), p.getSpent(), p.getProgressPercentage(), p.getStatus(),
                p.getStartDate(), p.getEstEndDate(), companyId, companyName, pmName, assignments
        );
    }
    private ProjectAssignmentResponse assignment(ProjectAssignment a) {
        User u = a.getUser();
        return new ProjectAssignmentResponse(a.getId(), u.getId(), (u.getFirstName()+" "+u.getLastName()).trim(), u.getEmail(), a.getAssignmentRole());
    }
}
