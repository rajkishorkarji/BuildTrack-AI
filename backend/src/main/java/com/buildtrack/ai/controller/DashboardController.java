package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStats()));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDailyActivities() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDailyActivities()));
    }

    @GetMapping("/site-map")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSiteMapZones() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSiteMapZones()));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAnalytics()));
    }
}
