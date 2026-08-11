package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.AiInsight;

import java.util.List;
import java.util.Map;

public interface AiInsightService {
    List<Map<String, Object>> getVisibleInsights(User user, Long projectId);
    Map<String, Object> runProjectDiagnostics(Long projectId, User user);
    Map<String, Object> runInference(Double budget, Double spent, Double progress);
    List<Map<String, Object>> matchWorkers(Long projectId, String skill, User user);
}
