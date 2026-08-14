package com.buildtrack.ai.dto.finance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinanceCreateRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;

    private String invoiceNumber;

    @NotBlank(message = "Vendor/Contractor name is required")
    private String vendorName;

    private String category = "Material & Labor";

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private BigDecimal gstAmount;

    private String status = "PENDING";

    private LocalDate dueDate;
}
