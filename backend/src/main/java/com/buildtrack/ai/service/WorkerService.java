package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Worker;
import java.util.List;

public interface WorkerService {
    List<Worker> getAllWorkers();
    List<Worker> getWorkersByCompany(Long companyId);
    Worker createWorker(Worker worker);
    Worker getWorkerById(Long id);
}
