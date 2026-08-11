package com.buildtrack.ai.dto.project;

public record ProjectAssignmentResponse(Long assignmentId, Long userId, String fullName, String email, String role) {}
