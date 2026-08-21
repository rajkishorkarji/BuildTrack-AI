package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Material;
import com.buildtrack.ai.entity.MaterialRequest;
import com.buildtrack.ai.entity.MaterialTransaction;
import com.buildtrack.ai.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR','WORKER')")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Material>>> list(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getVisibleMaterials(projectId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<Material>> create(@RequestBody Material material) {
        return ResponseEntity.ok(ApiResponse.success(materialService.create(material)));
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<MaterialTransaction>> receive(
            @PathVariable Long id, @RequestBody MaterialTransaction transaction) {
        return ResponseEntity.ok(ApiResponse.success(materialService.receive(id, transaction)));
    }

    @PostMapping("/{id}/issue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','SITE_ENGINEER','CONTRACTOR','WORKER')")
    public ResponseEntity<ApiResponse<MaterialTransaction>> issue(
            @PathVariable Long id, @RequestBody MaterialTransaction transaction) {
        return ResponseEntity.ok(ApiResponse.success(materialService.issue(id, transaction)));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<MaterialTransaction>>> history(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.history(id)));
    }

    // Material Request Endpoints
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<MaterialRequest>>> listRequests(@RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(materialService.getRequests(projectId)));
    }

    @PostMapping("/requests")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<MaterialRequest>> createRequest(@RequestBody MaterialRequest request) {
        return ResponseEntity.ok(ApiResponse.success(materialService.createRequest(request)));
    }

    @PostMapping("/requests/{id}/issue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','CONTRACTOR','SITE_ENGINEER')")
    public ResponseEntity<ApiResponse<MaterialRequest>> issueRequest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.issueRequest(id)));
    }

    @PostMapping("/requests/{id}/worker-receive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR','WORKER')")
    public ResponseEntity<ApiResponse<MaterialRequest>> workerReceiveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.workerReceiveRequest(id)));
    }

    @PostMapping("/requests/{id}/confirm")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<MaterialRequest>> confirmRequest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(materialService.confirmRequest(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','COMPANY_ADMIN','SITE_ENGINEER','CONTRACTOR')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
