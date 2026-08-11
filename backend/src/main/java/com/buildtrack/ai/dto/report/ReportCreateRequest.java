package com.buildtrack.ai.dto.report;
import jakarta.validation.constraints.*;
public record ReportCreateRequest(@NotBlank String title, @NotBlank String reportType, Long projectId) {}
