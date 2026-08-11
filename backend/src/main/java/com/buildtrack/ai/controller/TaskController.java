package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.task.*;
import com.buildtrack.ai.service.TaskService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR','WORKER')")
public class TaskController {
    private final TaskService taskService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks() {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTasksForUser(tenantAccessService.currentUser())));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTasksByProject(projectId, tenantAccessService.currentUser())));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<TaskResponse>> create(@Valid @RequestBody TaskCreateRequest request) {
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.isSuperAdmin(actor)) {
            tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());
        }
        return ResponseEntity.ok(ApiResponse.success(taskService.createTask(request, actor)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateProgress(@PathVariable Long id, @Valid @RequestBody TaskProgressRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskService.updateTaskProgress(id, request, tenantAccessService.currentUser())));
    }

    @PutMapping("/{id}/assignee/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER')")
    public ResponseEntity<ApiResponse<TaskResponse>> assign(@PathVariable Long id, @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.assignTask(id, userId, tenantAccessService.currentUser())));
    }
}
