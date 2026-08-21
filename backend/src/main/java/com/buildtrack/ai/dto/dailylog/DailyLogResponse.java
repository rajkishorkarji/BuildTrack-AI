package com.buildtrack.ai.dto.dailylog;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DailyLogResponse(
    Long id, Long projectId, String projectName, Long createdByUserId, String createdBy,
    Long taskId, String taskTitle,
    LocalDate logDate, String workSummary, String blockers, String safetyNotes,
    String weather, Integer progressPercentage, String status, LocalDateTime createdAt
) {}
