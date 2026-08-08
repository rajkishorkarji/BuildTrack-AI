package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.service.FinanceService;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired
    private FinanceService financeService;
    @Autowired private TenantAccessService tenantAccessService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, String>>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(financeService.getOverview()));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<Finance>>> getInvoices() {
        User user = tenantAccessService.currentUser();
        List<Finance> invoices = tenantAccessService.isSuperAdmin(user) ? financeService.getInvoices()
                : financeService.getInvoicesByCompany(tenantAccessService.currentCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(invoices));
    }
}
