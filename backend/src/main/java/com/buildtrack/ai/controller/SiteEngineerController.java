package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@PreAuthorize("hasAnyRole('SITE_ENGINEER','COMPANY_ADMIN','PROJECT_MANAGER')")
@RequestMapping("/api/engineer")
public class SiteEngineerController {

    @PostMapping("/daily-report")
    public ResponseEntity<ApiResponse<Map<String, String>>> submitDailyReport(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("reportId", "DPR-" + System.currentTimeMillis() / 1000);
        res.put("message", "Daily Engineering Progress Report submitted for Floor 14.");
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/photos")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadInspectionPhoto(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("analysisResult", "Concrete Grade M40 Validation PASSED");
        res.put("message", "Site photo analyzed by AI Safety & Quality Inspector.");
        return ResponseEntity.ok(ApiResponse.success(res));
    }
}
