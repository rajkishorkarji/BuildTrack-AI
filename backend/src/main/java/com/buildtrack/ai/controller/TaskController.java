package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.service.TaskService;
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

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskEntity>>> getTasks() {
        return ResponseEntity.ok(ApiResponse.success(taskService.getAllTasks()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskEntity>> createTask(@RequestBody TaskEntity taskData) {
        return ResponseEntity.ok(ApiResponse.success(taskService.createTask(taskData)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskEntity>> updateProgress(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer progress = body.containsKey("progress") ? Integer.parseInt(body.get("progress").toString()) : null;
        String status = body.containsKey("status") ? body.get("status").toString() : null;
        return ResponseEntity.ok(ApiResponse.success(taskService.updateTaskProgress(id, progress, status)));
    }
}
