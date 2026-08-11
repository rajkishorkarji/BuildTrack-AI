package com.buildtrack.ai.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CompanyRegistrationRequest(

        @NotBlank(message = "Company name is required")
        String companyName,

        @NotBlank(message = "Company email is required")
        @Email(message = "Invalid company email")
        String companyEmail,

        String phone,

        String address,

        @NotBlank(message = "Subscription plan is required")
        String plan
) {
}