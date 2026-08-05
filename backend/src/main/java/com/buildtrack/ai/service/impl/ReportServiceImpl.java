package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.service.ReportService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReportServiceImpl implements ReportService {

    private final List<Map<String, Object>> reports = new ArrayList<>(List.of(
        Map.of("id", 1, "title", "DPR - Metro Tower Complex - Floor 14 Concrete Pour", "author", "Divya Krishnan", "date", "2025-06-21", "status", "Submitted", "weather", "Sunny 31°C"),
        Map.of("id", 2, "title", "DPR - Riverside Apartments - Plumbing & Electrical", "author", "Vikram Nair", "date", "2025-06-20", "status", "Approved", "weather", "Partly Cloudy")
    ));

    @Override
    public List<Map<String, Object>> getReports() {
        return reports;
    }

    @Override
    public Map<String, Object> createReport(Map<String, Object> reportData) {
        reports.add(0, reportData);
        return reportData;
    }
}
