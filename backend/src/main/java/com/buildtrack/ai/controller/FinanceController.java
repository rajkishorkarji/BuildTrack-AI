package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.service.FinanceService;
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

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, String>>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(financeService.getOverview()));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<Finance>>> getInvoices() {
        return ResponseEntity.ok(ApiResponse.success(financeService.getInvoices()));
    }
}
