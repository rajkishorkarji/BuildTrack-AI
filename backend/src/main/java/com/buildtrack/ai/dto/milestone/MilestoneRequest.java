package com.buildtrack.ai.dto.milestone;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record MilestoneRequest(
        @NotNull Long projectId,
        @NotBlank String title,
        String description,
        LocalDate dueDate
) {}
