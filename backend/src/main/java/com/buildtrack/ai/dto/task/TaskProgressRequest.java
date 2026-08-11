package com.buildtrack.ai.dto.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record TaskProgressRequest(
        @Min(0) @Max(100) Integer progress,
        String status
) {}
