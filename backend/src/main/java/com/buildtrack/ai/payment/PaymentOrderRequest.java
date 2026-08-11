package com.buildtrack.ai.payment;

import jakarta.validation.constraints.NotBlank;

public record PaymentOrderRequest(
        @NotBlank String planCode
) {}
