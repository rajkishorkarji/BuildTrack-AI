package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.issue.IssueRequest;
import com.buildtrack.ai.dto.issue.IssueResponse;
import com.buildtrack.ai.service.SiteIssueService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class SiteIssueController {
    private final SiteIssueService service;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IssueResponse>>> list() {
        User user = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(service.list(user)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<IssueResponse>> create(@Valid @RequestBody IssueRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.create(request, tenantAccessService.currentUser())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<IssueResponse>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(service.updateStatus(id, body.get("status"), tenantAccessService.currentUser())));
    }
}
