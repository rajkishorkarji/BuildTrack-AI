package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.dto.milestone.MilestoneRequest;
import com.buildtrack.ai.dto.milestone.MilestoneResponse;
import com.buildtrack.ai.service.MilestoneService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR','WORKER')")
public class MilestoneController {

    private final MilestoneService milestoneService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> list(
            @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(
                milestoneService.list(tenantAccessService.currentUser(), projectId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<MilestoneResponse>> create(@Valid @RequestBody MilestoneRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                milestoneService.create(request, tenantAccessService.currentUser())));
    }
}
