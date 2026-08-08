package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.service.EquipmentService;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.ProjectRepository;
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
    @Autowired private TenantAccessService tenantAccessService;
    @Autowired private ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Equipment>>> getEquipment() {
        User user = tenantAccessService.currentUser();
        List<Equipment> equipment = tenantAccessService.isSuperAdmin(user) ? equipmentService.getAllEquipment()
                : equipmentService.getEquipmentByCompany(tenantAccessService.currentCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(equipment));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Equipment>> createEquipment(@RequestBody Equipment equipment) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());
        if (equipment.getProject() != null && equipment.getProject().getId() != null) {
            Project project = projectRepository.findById(equipment.getProject().getId()).orElseThrow(() -> new IllegalArgumentException("Project not found"));
            if (!tenantAccessService.currentCompany().getId().equals(project.getCompany().getId())) throw new IllegalArgumentException("Project belongs to another tenant");
            equipment.setProject(project);
        }
        return ResponseEntity.ok(ApiResponse.success(equipmentService.createEquipment(equipment)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Equipment>> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "ACTIVE");
        return ResponseEntity.ok(ApiResponse.success(equipmentService.updateStatus(id, newStatus)));
    }
}
