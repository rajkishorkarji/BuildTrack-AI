package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.service.AiInsightService;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-insights")
@RequiredArgsConstructor
public class AiInsightController {

    private final AiInsightService aiInsightService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInsights(
            @RequestParam(required = false) Long projectId) {
        User user = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(
                aiInsightService.getVisibleInsights(user, projectId)));
    }

    @PostMapping("/projects/{projectId}/diagnostics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runProjectDiagnostics(
            @PathVariable Long projectId) {
        User user = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(
                aiInsightService.runProjectDiagnostics(projectId, user)));
    }

    @PostMapping("/run-inference")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerInference(
            @RequestBody(required = false) Map<String, Double> payload) {
        User user = tenantAccessService.currentUser();
        if (!tenantAccessService.isSuperAdmin(user) &&
                !tenantAccessService.hasRole(user, "COMPANY_ADMIN") &&
                !tenantAccessService.hasRole(user, "PROJECT_MANAGER")) {
            throw new com.buildtrack.ai.exception.UnauthorizedException(
                    "You do not have permission to run AI diagnostics");
        }

        Double b = payload != null ? payload.get("budget") : null;
        Double s = payload != null ? payload.get("spent") : null;
        Double p = payload != null ? payload.get("progress") : null;
        return ResponseEntity.ok(ApiResponse.success(
                aiInsightService.runInference(b, s, p)));
    }

    @GetMapping("/projects/{projectId}/worker-matches")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> matchWorkers(
            @PathVariable Long projectId,
            @RequestParam String skill) {
        User user = tenantAccessService.currentUser();
        return ResponseEntity.ok(ApiResponse.success(
                aiInsightService.matchWorkers(projectId, skill, user)));
    }
}
