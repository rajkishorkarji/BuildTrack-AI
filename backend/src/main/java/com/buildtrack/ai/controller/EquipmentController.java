package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.entity.EquipmentMaintenance;
import com.buildtrack.ai.service.EquipmentService;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Equipment>>> getEquipment() {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getVisibleEquipment()));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<Equipment>> createEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.createEquipment(equipment)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER')")
    public ResponseEntity<ApiResponse<Equipment>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                equipmentService.updateStatus(id, body.getOrDefault("status", "OPERATIONAL"))));
    }

    @PatchMapping("/{id}/assignment")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<Equipment>> assign(
            @PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ApiResponse.success(
                equipmentService.assign(id, body.get("userId"))));
    }

    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','SITE_ENGINEER')")
    public ResponseEntity<ApiResponse<EquipmentMaintenance>> scheduleMaintenance(
            @PathVariable Long id, @RequestBody EquipmentMaintenance maintenance) {
        return ResponseEntity.ok(ApiResponse.success(
                equipmentService.scheduleMaintenance(id, maintenance)));
    }

    @GetMapping("/{id}/maintenance")
    public ResponseEntity<ApiResponse<List<EquipmentMaintenance>>> maintenanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.maintenanceHistory(id)));
    }
}
