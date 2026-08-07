package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Worker;
import com.buildtrack.ai.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Worker>>> getWorkers() {
        return ResponseEntity.ok(ApiResponse.success(workerService.getAllWorkers()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Worker>> createWorker(@RequestBody Worker worker) {
        return ResponseEntity.ok(ApiResponse.success(workerService.createWorker(worker)));
    }
}
