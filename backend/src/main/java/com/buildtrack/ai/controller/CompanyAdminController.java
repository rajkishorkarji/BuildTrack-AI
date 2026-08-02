package com.buildtrack.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyAdminController {

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getCompanyOverview() {
        Map<String, Object> data = new HashMap<>();
        data.put("companyName", "Solviontech Infrastructure Ltd");
        data.put("totalFinancialCap", 500000.00);
        data.put("cpi", 0.895);
        data.put("spi", 0.765);
        data.put("activeEmployees", 850);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/projects")
    public ResponseEntity<Map<String, String>> createProject(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Project " + request.get("name") + " created by Company Admin.");
        return ResponseEntity.ok(res);
    }
}
