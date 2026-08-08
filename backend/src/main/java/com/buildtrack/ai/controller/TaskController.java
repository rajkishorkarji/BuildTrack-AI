package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.service.TaskService;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;
    @Autowired private TenantAccessService tenantAccessService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskEntity>>> getTasks() {
        User user = tenantAccessService.currentUser();
        List<TaskEntity> tasks = tenantAccessService.isSuperAdmin(user)
                ? taskService.getAllTasks()
                : taskService.getTasksByCompany(tenantAccessService.currentCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskEntity>> createTask(@RequestBody TaskEntity taskData) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());
        if (taskData.getProject() == null || taskData.getProject().getId() == null) throw new IllegalArgumentException("A project is required");
        Project project = projectRepository.findById(taskData.getProject().getId()).orElseThrow(() -> new IllegalArgumentException("Project not found"));
        if (!tenantAccessService.currentCompany().getId().equals(project.getCompany().getId())) throw new IllegalArgumentException("Project belongs to another tenant");
        taskData.setProject(project);
        return ResponseEntity.ok(ApiResponse.success(taskService.createTask(taskData)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskEntity>> updateProgress(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = tenantAccessService.currentUser();
        if (!tenantAccessService.isSuperAdmin(user)) {
            tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());
            TaskEntity task = taskRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Task not found"));
            if (!tenantAccessService.currentCompany().getId().equals(task.getProject().getCompany().getId())) {
                throw new IllegalArgumentException("Task belongs to another tenant");
            }
        }
        Integer progress = body.containsKey("progress") ? Integer.parseInt(body.get("progress").toString()) : null;
        String status = body.containsKey("status") ? body.get("status").toString() : null;
        return ResponseEntity.ok(ApiResponse.success(taskService.updateTaskProgress(id, progress, status)));
    }
}
