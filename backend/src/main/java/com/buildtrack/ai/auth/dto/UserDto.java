package com.buildtrack.ai.auth.dto;

import java.util.List;

public record UserDto(
    Long id,
    String name,
    String email,
    String role,
    List<String> permissions
) {}
