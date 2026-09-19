package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Worker;
import com.buildtrack.ai.service.SubscriptionPlanService;
import com.buildtrack.ai.service.WorkerService;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('SUPER_ADMIN','WORKER','CONTRACTOR','SITE_ENGINEER','PROJECT_MANAGER','COMPANY_ADMIN')")
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;
    private final TenantAccessService tenantAccessService;
    private final SubscriptionPlanService subscriptionPlanService;

    WorkerController(WorkerService workerService, TenantAccessService tenantAccessService, SubscriptionPlanService subscriptionPlanService) {
        this.workerService = workerService;
        this.tenantAccessService = tenantAccessService;
        this.subscriptionPlanService = subscriptionPlanService;
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
        Company company = tenantAccessService.currentCompany();
        worker.setCompanyId(company.getId());
        tenantAccessService.requireActiveSubscription(company);
        subscriptionPlanService.validateWorkerCreationAllowed(company);
        return ResponseEntity.ok(ApiResponse.success(workerService.createWorker(worker)));
    }
}
