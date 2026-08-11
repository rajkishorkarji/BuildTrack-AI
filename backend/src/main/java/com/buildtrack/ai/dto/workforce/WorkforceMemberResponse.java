package com.buildtrack.ai.dto.workforce;

import java.util.List;

public record WorkforceMemberResponse(
        Long userId,
        String fullName,
        String email,
        String phone,
        String role,
        boolean enabled,
        Long companyId,
        String companyName,
        String projectName,
        List<ProjectAssignmentItem> projects
) {
    public record ProjectAssignmentItem(Long projectId, String projectName, String assignmentRole) {}
}
