package com.buildtrack.ai.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PersonnelInviteRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank String role
) {}
