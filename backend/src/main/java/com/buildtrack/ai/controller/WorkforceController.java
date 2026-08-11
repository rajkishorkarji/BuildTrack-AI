package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.workforce.WorkforceMemberResponse;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.service.WorkforceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workforce")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR','WORKER')")
public class WorkforceController {
    private final WorkforceService workforceService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkforceMemberResponse>>> list() {
        User actor = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(workforceService.getAccessibleWorkforce(actor)));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<WorkforceMemberResponse>> get(@PathVariable Long userId) {
        User actor = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(workforceService.getMember(userId, actor)));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<WorkforceMemberResponse>> updateStatus(
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, Boolean> body) {
        User actor = tenantAccessService.currentUser();
        boolean enabled = body != null && Boolean.TRUE.equals(body.get("enabled"));
        return ResponseEntity.ok(ApiResponse.success(workforceService.updateStatus(userId, enabled, actor)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> remove(@PathVariable Long userId) {
        User actor = tenantAccessService.currentUser();
        workforceService.removeMember(userId, actor);
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("message", "Workforce member removed successfully")));
    }
}
