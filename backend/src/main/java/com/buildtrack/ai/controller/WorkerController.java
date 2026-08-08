package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Worker;
import com.buildtrack.ai.service.WorkerService;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;
    private final TenantAccessService tenantAccessService;

    WorkerController(WorkerService workerService, TenantAccessService tenantAccessService) {
        this.workerService = workerService;
        this.tenantAccessService = tenantAccessService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Worker>>> getWorkers() {
        User user = tenantAccessService.currentUser();
        List<Worker> workers = tenantAccessService.isSuperAdmin(user)
                ? workerService.getAllWorkers()
                : workerService.getWorkersByCompany(tenantAccessService.currentCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(workers));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Worker>> createWorker(@RequestBody Worker worker) {
        User user = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(user);
        worker.setCompanyId(tenantAccessService.currentCompany().getId());
        tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());
        return ResponseEntity.ok(ApiResponse.success(workerService.createWorker(worker)));
    }
}
