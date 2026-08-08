package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.service.NotificationService;
import com.buildtrack.ai.entity.Notification;
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


    @Autowired
    private RealtimePublisher realtimePublisher;
    @Autowired private TenantAccessService tenantAccessService;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getProjects() {
        User user = tenantAccessService.currentUser();
        List<Project> projects = tenantAccessService.isSuperAdmin(user)
                ? projectService.getAllProjects()
                : projectService.getProjectsByCompany(tenantAccessService.currentCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project projectData) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        Company comp = tenantAccessService.currentCompany();
        tenantAccessService.requireActiveSubscription(comp);
        Project created = projectService.createProject(comp.getId(), projectData);
        if (created.getAssignedProjectManagerEmail() != null) {
            userRepository.findByEmail(created.getAssignedProjectManagerEmail()).ifPresent(manager -> {
                if (comp.getId().equals(manager.getCompanyId())) {
                    notificationService.notifyUser(manager, comp.getId(), user.getFirstName() + " " + user.getLastName(),
                            "Project assigned", "You were assigned to project: " + created.getName(), Notification.NotificationType.INFO);
                }
            });
        }
        realtimePublisher.publish("projects", "created", created.getId());
        return ResponseEntity.ok(ApiResponse.success(created));
    }
}
