package com.buildtrack.ai.dto.report;
import java.time.LocalDateTime;
public record ReportResponse(Long id, Long projectId, String projectName, String title, String reportType, String summaryJson, String generatedBy, LocalDateTime generatedAt) {}
