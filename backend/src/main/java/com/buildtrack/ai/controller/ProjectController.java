package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getProjects() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllProjects()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project projectData) {
        Company comp = companyRepository.findAll().stream().findFirst().orElseGet(() -> {
            Company c = new Company();
            c.setName("Default Company");
            return companyRepository.save(c);
        });
        Project created = projectService.createProject(comp.getId(), projectData);
        return ResponseEntity.ok(ApiResponse.success(created));
    }
}