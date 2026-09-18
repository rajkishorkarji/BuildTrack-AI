package com.buildtrack.ai.dto.milestone;

import java.time.LocalDate;

public record MilestoneResponse(
        Long id,
        Long projectId,
        String projectName,
        String title,
        LocalDate dueDate,
        String status,
        Integer completionPercentage,
        long taskCount,
        long completedTaskCount
) {}
