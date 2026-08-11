package com.buildtrack.ai.dto.project;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProjectSummaryResponse(
        Long id, String name, String code, String location, String description,
        BigDecimal budget, BigDecimal spent, Integer progressPercentage, String status,
        LocalDate startDate, LocalDate estEndDate, List<ProjectAssignmentResponse> assignments) {}
