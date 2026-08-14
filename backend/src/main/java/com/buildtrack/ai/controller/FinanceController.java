package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.finance.FinanceCreateRequest;
import com.buildtrack.ai.dto.finance.FinanceResponse;
import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.service.FinanceService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;
    private final TenantAccessService tenantAccessService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        User user = tenantAccessService.currentUser();
        if (tenantAccessService.isSuperAdmin(user)) {
            return ResponseEntity.ok(ApiResponse.success(
                    Map.of("invoices", financeService.getInvoices().size())
            ));
        }
        return ResponseEntity.ok(ApiResponse.success(
                financeService.getOverview(tenantAccessService.currentCompany().getId())
        ));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<FinanceResponse>>> getInvoices() {
        User user = tenantAccessService.currentUser();
        List<Finance> invoices = tenantAccessService.isSuperAdmin(user)
                ? financeService.getInvoices()
                : financeService.getInvoicesByCompany(tenantAccessService.currentCompany().getId());

        List<FinanceResponse> responseList = invoices.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responseList));
    }

    @PostMapping("/invoices")
    public ResponseEntity<ApiResponse<FinanceResponse>> createInvoice(@Valid @RequestBody FinanceCreateRequest request) {
        User user = tenantAccessService.currentUser();
        Finance invoice = financeService.createInvoice(request, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(invoice)));
    }

    @PatchMapping("/invoices/{id}/status")
    public ResponseEntity<ApiResponse<FinanceResponse>> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = tenantAccessService.currentUser();
        String status = body.getOrDefault("status", "PAID");
        Finance updated = financeService.updateInvoiceStatus(id, status, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(updated)));
    }

    private FinanceResponse toResponse(Finance f) {
        BigDecimal amt = f.getAmount() != null ? f.getAmount() : BigDecimal.ZERO;
        BigDecimal gst = f.getGstAmount() != null ? f.getGstAmount() : BigDecimal.ZERO;
        Long companyId = null;
        String companyName = null;
        if (f.getProject() != null && f.getProject().getCompany() != null) {
            companyId = f.getProject().getCompany().getId();
            companyName = f.getProject().getCompany().getName();
        }
        return new FinanceResponse(
                f.getId(),
                f.getProject() != null ? f.getProject().getId() : null,
                f.getProject() != null ? f.getProject().getName() : null,
                companyId,
                companyName,
                f.getInvoiceNumber(),
                f.getVendorName(),
                f.getCategory(),
                amt,
                gst,
                amt.add(gst),
                f.getStatus() != null ? f.getStatus().name() : "PENDING",
                f.getDueDate(),
                f.getPaidAt(),
                f.getCreatedAt()
        );
    }
}
