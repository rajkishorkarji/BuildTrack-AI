package com.buildtrack.ai.auth.dto;

import java.util.List;

public record UserDto(
    Long id,
    String name,
    String email,
    String role,
    Long companyId,
    String companyCode,
    String companyName,
    Long assignedProjectId,
    List<String> permissions
) {}
