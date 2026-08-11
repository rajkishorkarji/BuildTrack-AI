package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.dto.equipment.EquipmentMaintenanceResponse;
import com.buildtrack.ai.dto.equipment.EquipmentResponse;
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
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getEquipment() {
        List<EquipmentResponse> result = equipmentService.getVisibleEquipment()
                .stream().map(EquipmentResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> createEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(ApiResponse.success(
                EquipmentResponse.from(equipmentService.createEquipment(equipment))));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                EquipmentResponse.from(equipmentService.updateStatus(id, body.getOrDefault("status", "OPERATIONAL")))));
    }

    @PatchMapping("/{id}/assignment")
    @PreAuthorize("hasRole('COMPANY_ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> assign(
            @PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(ApiResponse.success(
                EquipmentResponse.from(equipmentService.assign(id, body.get("userId")))));
    }

    @PostMapping("/{id}/maintenance")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','SITE_ENGINEER')")
    public ResponseEntity<ApiResponse<EquipmentMaintenanceResponse>> scheduleMaintenance(
            @PathVariable Long id, @RequestBody EquipmentMaintenance maintenance) {
        return ResponseEntity.ok(ApiResponse.success(
                EquipmentMaintenanceResponse.from(equipmentService.scheduleMaintenance(id, maintenance))));
    }

    @GetMapping("/{id}/maintenance")
    public ResponseEntity<ApiResponse<List<EquipmentMaintenanceResponse>>> maintenanceHistory(@PathVariable Long id) {
        List<EquipmentMaintenanceResponse> result = equipmentService.maintenanceHistory(id)
                .stream().map(EquipmentMaintenanceResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
