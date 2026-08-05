package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReports() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReports()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createReport(@RequestBody Map<String, Object> reportData) {
        return ResponseEntity.ok(ApiResponse.success(reportService.createReport(reportData)));
    }
}
