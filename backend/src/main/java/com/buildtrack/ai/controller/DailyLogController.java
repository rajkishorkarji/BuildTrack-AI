package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.dailylog.DailyLogRequest;
import com.buildtrack.ai.dto.dailylog.DailyLogResponse;
import com.buildtrack.ai.service.DailyLogService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/daily-logs")
@RequiredArgsConstructor
public class DailyLogController {
    private final DailyLogService dailyLogService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DailyLogResponse>>> get(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(dailyLogService.getLogs(tenantAccessService.currentUser(), projectId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<DailyLogResponse>> create(@Valid @RequestBody DailyLogRequest request) {
        return ResponseEntity.ok(ApiResponse.success(dailyLogService.create(request, tenantAccessService.currentUser())));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<DailyLogResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dailyLogService.approve(id, tenantAccessService.currentUser())));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<DailyLogResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(dailyLogService.reject(id, tenantAccessService.currentUser())));
    }
}
