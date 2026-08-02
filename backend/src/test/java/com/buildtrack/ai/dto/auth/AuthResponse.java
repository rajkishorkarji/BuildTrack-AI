package com.buildtrack.ai.dto.auth;

import com.buildtrack.ai.entity.Role;

public record AuthResponse(
        String token,
        Long userId,
        String fullName,
        String email,
        Role role
) {
}