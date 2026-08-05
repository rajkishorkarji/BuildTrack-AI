package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.AiInsight;
import com.buildtrack.ai.service.AiInsightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai-insights")
public class AiInsightController {

    @Autowired
    private AiInsightService aiInsightService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AiInsight>>> getInsights() {
        return ResponseEntity.ok(ApiResponse.success(aiInsightService.getInsights()));
    }

    @PostMapping("/run-inference")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerInference(@RequestBody(required = false) Map<String, Double> payload) {
        Double b = payload != null ? payload.get("budget") : 150000.0;
        Double s = payload != null ? payload.get("spent") : 120000.0;
        Double p = payload != null ? payload.get("progress") : 75.0;
        return ResponseEntity.ok(ApiResponse.success(aiInsightService.runInference(b, s, p)));
    }
}
