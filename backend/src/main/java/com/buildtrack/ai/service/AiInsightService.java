package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.AiInsight;
import java.util.List;
import java.util.Map;

public interface AiInsightService {
    List<AiInsight> getInsights();
    Map<String, Object> runInference(Double budget, Double spent, Double progress);
}
