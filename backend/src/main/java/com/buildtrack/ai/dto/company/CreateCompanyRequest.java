package com.buildtrack.ai.dto.company;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateCompanyRequest(

        @NotBlank(message = "Company name is required")
        String companyName,

        @NotBlank(message = "Company email is required")
        @Email
        String companyEmail,

        String phone,

        String address,

        String companyCode,

        @NotBlank(message = "Subscription plan is required")
        String plan,

        @NotBlank(message = "Admin first name is required")
        String adminFirstName,

        @NotBlank(message = "Admin last name is required")
        String adminLastName,

        @NotBlank(message = "Admin email is required")
        @Email
        String adminEmail
) {
}