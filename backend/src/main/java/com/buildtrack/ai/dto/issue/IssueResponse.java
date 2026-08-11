package com.buildtrack.ai.dto.issue;

import java.time.LocalDateTime;

public record IssueResponse(
        Long id,
        Long projectId,
        String projectName,
        String title,
        String description,
        String severity,
        String location,
        String status,
        String reportedBy,
        LocalDateTime createdAt
) {}
