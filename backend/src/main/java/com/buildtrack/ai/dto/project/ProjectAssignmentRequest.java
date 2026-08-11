package com.buildtrack.ai.dto.project;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class ProjectAssignmentRequest {
    @NotNull private Long userId;
    @Pattern(regexp = "PROJECT_MANAGER|SITE_ENGINEER|CONTRACTOR|WORKER")
    private String role;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
