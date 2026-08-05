package com.buildtrack.ai.service;

import java.util.List;
import java.util.Map;

public interface ReportService {
    List<Map<String, Object>> getReports();
    Map<String, Object> createReport(Map<String, Object> reportData);
}
