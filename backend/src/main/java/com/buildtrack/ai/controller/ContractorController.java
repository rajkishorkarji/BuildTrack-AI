package com.buildtrack.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contractor")
public class ContractorController {

    @PostMapping("/invoice")
    public ResponseEntity<Map<String, String>> submitInvoice(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Subcontractor labor payment claim submitted to Company Admin.");
        return ResponseEntity.ok(res);
    }
}
