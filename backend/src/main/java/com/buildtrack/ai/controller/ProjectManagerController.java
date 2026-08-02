package com.buildtrack.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pm")
public class ProjectManagerController {

    @GetMapping("/projects")
    public ResponseEntity<Map<String, Object>> getMyProjects() {
        Map<String, Object> res = new HashMap<>();
        res.put("assignedProject", "Metro Tower Complex");
        res.put("progress", 66);
        res.put("delayRisk", 34.5);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String, String>> createTask(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Task " + request.get("title") + " scheduled on Gantt timeline.");
        return ResponseEntity.ok(res);
    }
}
