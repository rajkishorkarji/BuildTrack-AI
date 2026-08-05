package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pm")
public class ProjectManagerController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProjects() {
        List<Project> projects = projectService.getAllProjects();
        Project first = projects.isEmpty() ? null : projects.get(0);

        Map<String, Object> res = new HashMap<>();
        res.put("assignedProject", first != null ? first.getName() : "Metro Tower Complex");
        res.put("progress", first != null ? first.getProgressPercentage() : 66);
        res.put("delayRisk", 34.5);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskEntity>> createTask(@RequestBody TaskEntity task) {
        return ResponseEntity.ok(ApiResponse.success(taskService.createTask(task)));
    }
}
