package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contractor")
public class ContractorController {

    @PostMapping("/invoice")
    public ResponseEntity<ApiResponse<Map<String, String>>> submitInvoice(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("invoiceId", "INV-" + System.currentTimeMillis() / 1000);
        res.put("message", "Subcontractor labor payment claim submitted cleanly to Company Admin.");
        return ResponseEntity.ok(ApiResponse.success(res));
    }
}
