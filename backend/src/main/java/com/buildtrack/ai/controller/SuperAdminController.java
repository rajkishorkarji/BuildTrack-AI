package com.buildtrack.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
public class SuperAdminController {

    @GetMapping("/companies")
    public ResponseEntity<Map<String, Object>> getCompanies() {
        Map<String, Object> res = new HashMap<>();
        res.put("totalCompanies", 24);
        res.put("activeSubscriptions", 22);
        res.put("serverStatus", "99.98% Healthy");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/companies")
    public ResponseEntity<Map<String, String>> createCompany(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Tenant company " + request.get("companyName") + " registered successfully.");
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Map<String, String>> deleteCompany(@PathVariable Long id) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Company ID " + id + " suspended.");
        return ResponseEntity.ok(res);
    }
}
