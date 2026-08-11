package com.buildtrack.ai.dto.dailylog;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record DailyLogRequest(
    @NotNull Long projectId,
    @NotNull LocalDate logDate,
    @NotBlank @Size(max = 1000) String workSummary,
    @Size(max = 5000) String blockers,
    @Size(max = 5000) String safetyNotes,
    @Size(max = 255) String weather,
    @Min(0) @Max(100) Integer progressPercentage
) {}
