package com.buildtrack.ai.service;

import java.util.List;
import java.util.Map;

public interface DashboardService {
    List<Map<String, Object>> getStats();
    List<Map<String, Object>> getDailyActivities();
    List<Map<String, Object>> getSiteMapZones();
    List<Map<String, Object>> getAnalytics();
}
