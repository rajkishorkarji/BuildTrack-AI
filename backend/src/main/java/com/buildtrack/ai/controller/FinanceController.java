package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.service.FinanceService;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','CONTRACTOR')")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;
    private final TenantAccessService tenantAccessService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        User user = tenantAccessService.currentUser();
        if (tenantAccessService.isSuperAdmin(user)) {
            // Platform-wide aggregation remains available to Super Admin.
            return ResponseEntity.ok(ApiResponse.success(
                    Map.of("invoices", financeService.getInvoices().size())
            ));
        }
        return ResponseEntity.ok(ApiResponse.success(
                financeService.getOverview(tenantAccessService.currentCompany().getId())
        ));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<Finance>>> getInvoices() {
        User user = tenantAccessService.currentUser();
        List<Finance> invoices = tenantAccessService.isSuperAdmin(user)
                ? financeService.getInvoices()
                : financeService.getInvoicesByCompany(tenantAccessService.currentCompany().getId());

        return ResponseEntity.ok(ApiResponse.success(invoices));
    }
}
