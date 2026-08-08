package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.auth.dto.PersonnelInviteRequest;
import com.buildtrack.ai.auth.entity.UserInvitation;
import com.buildtrack.ai.auth.repository.UserInvitationRepository;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyAdminController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired private TenantAccessService tenantAccessService;
    @Autowired private UserInvitationRepository userInvitationRepository;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompanyOverview() {
        Company comp = tenantAccessService.currentCompany();
        Map<String, Object> data = new HashMap<>();
        data.put("companyName", comp != null ? comp.getName() : "Solviontech Infrastructure Ltd");
        data.put("totalFinancialCap", 500000.00);
        data.put("cpi", 0.895);
        data.put("spi", 0.765);
        data.put("activeEmployees", 850);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project project) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        Company comp = tenantAccessService.currentCompany();
        tenantAccessService.requireActiveSubscription(comp);
        Project created = projectService.createProject(comp.getId(), project);
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    @PostMapping("/subscription/activate")
    public ResponseEntity<ApiResponse<Company>> activateSubscription() {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        Company company = tenantAccessService.currentCompany();
        company.setSubscriptionStatus("ACTIVE");
        company.setSubscriptionActivatedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(ApiResponse.success(companyRepository.save(company)));
    }

    @PostMapping("/personnel")
    public ResponseEntity<ApiResponse<UserInvitation>> invitePersonnel(@RequestBody PersonnelInviteRequest request) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        Company company = tenantAccessService.currentCompany();
        tenantAccessService.requireActiveSubscription(company);
        String role = request.role().trim().toUpperCase().replace(' ', '_');
        if (!java.util.List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR", "WORKER").contains(role)) {
            throw new IllegalArgumentException("Personnel role is not supported");
        }
        UserInvitation invitation = userInvitationRepository.findByEmailIgnoreCaseAndCompanyId(request.email(), company.getId())
                .orElseGet(UserInvitation::new);
        invitation.setFullName(request.fullName().trim());
        invitation.setEmail(request.email().trim().toLowerCase());
        invitation.setRole(role);
        invitation.setCompanyId(company.getId());
        invitation.setClaimed(false);
        return ResponseEntity.ok(ApiResponse.success(userInvitationRepository.save(invitation)));
    }
}
