package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Equipment>>> getEquipment() {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getAllEquipment()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Equipment>> createEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.createEquipment(equipment)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Equipment>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "ACTIVE");
        return ResponseEntity.ok(ApiResponse.success(equipmentService.updateStatus(id, newStatus)));
    }
}
