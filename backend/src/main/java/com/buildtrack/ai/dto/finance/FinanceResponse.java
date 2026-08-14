package com.buildtrack.ai.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record FinanceResponse(
        Long id,
        Long projectId,
        String projectName,
        Long companyId,
        String companyName,
        String invoiceNumber,
        String vendorName,
        String category,
        BigDecimal amount,
        BigDecimal gstAmount,
        BigDecimal totalAmount,
        String status,
        LocalDate dueDate,
        LocalDateTime paidAt,
        LocalDateTime createdAt
) {}
