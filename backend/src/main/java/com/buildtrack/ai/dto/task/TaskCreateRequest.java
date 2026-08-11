package com.buildtrack.ai.dto.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record TaskCreateRequest(
        @NotNull Long projectId,
        @NotBlank String title,
        String description,
        String priority,
        LocalDate dueDate,
        Long assigneeUserId
) {}
