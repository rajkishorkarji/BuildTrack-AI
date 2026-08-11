package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.project.ProjectSummaryResponse;
import com.buildtrack.ai.dto.task.TaskCreateRequest;
import com.buildtrack.ai.dto.task.TaskResponse;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.service.TaskService;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasRole('PROJECT_MANAGER')")
@RequestMapping("/api/pm")
@RequiredArgsConstructor
public class ProjectManagerController {
    private final ProjectService projectService;
    private final TaskService taskService;
    private final TenantAccessService tenantAccessService;

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<List<ProjectSummaryResponse>>> getMyProjects() {
        User user = tenantAccessService.currentUser();
        List<ProjectSummaryResponse> result = projectService.getProjectsForUser(user).stream()
                .map(project -> new ProjectSummaryResponse(
                        project.getId(), project.getName(), project.getCode(), project.getLocation(),
                        project.getDescription(), project.getBudget(), project.getSpent(),
                        project.getProgressPercentage(), project.getStatus(), project.getStartDate(),
                        project.getEstEndDate(), List.of()))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@RequestBody TaskCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskService.createTask(request, tenantAccessService.currentUser())));
    }
}
