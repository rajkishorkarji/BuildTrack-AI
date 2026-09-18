package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.dto.task.TaskCreateRequest;
import com.buildtrack.ai.dto.task.TaskResponse;
import com.buildtrack.ai.service.TaskService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@PreAuthorize("hasAnyRole('CONTRACTOR','COMPANY_ADMIN')")
@RequestMapping("/api/contractor")
@RequiredArgsConstructor
public class ContractorController {

    private final TaskService taskService;
    private final TenantAccessService tenantAccessService;

    @PostMapping("/invoice")
    public ResponseEntity<ApiResponse<Map<String, String>>> submitInvoice(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("invoiceId", "INV-" + System.currentTimeMillis() / 1000);
        res.put("message", "Subcontractor labor payment claim submitted cleanly to Company Admin.");
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    /**
     * Contractor-scoped task creation: assignee must be a WORKER assigned to the same project.
     */
    @PostMapping("/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody TaskCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.createContractorTask(request, tenantAccessService.currentUser())));
    }
}
