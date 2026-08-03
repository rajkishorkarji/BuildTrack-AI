package com.buildtrack.ai.controller;

import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<Project>> getProjectsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(projectService.getProjectsByCompany(companyId));
    }

    @PostMapping("/company/{companyId}")
    public ResponseEntity<Project> createProject(@PathVariable Long companyId, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(companyId, project));
    }

    @PutMapping("/{projectId}/progress")
    public ResponseEntity<Project> updateProgress(@PathVariable Long projectId, @RequestParam Integer progress) {
        return ResponseEntity.ok(projectService.updateProgress(projectId, progress));
    }
}