package com.buildtrack.ai.dto.task;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        Long projectId,
        String projectName,
        String title,
        String description,
        String status,
        String priority,
        Integer completionPercentage,
        LocalDate dueDate,
        Long assigneeUserId,
        String assigneeName,
        String assigneeRole
) {}
