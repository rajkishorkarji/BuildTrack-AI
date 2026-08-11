package com.buildtrack.ai.dto.issue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IssueRequest(
        @NotNull Long projectId,
        @NotBlank String title,
        String description,
        String severity,
        String location,
        String status
) {}
