package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Worker;
import java.util.List;

public interface WorkerService {
    List<Worker> getAllWorkers();
    Worker createWorker(Worker worker);
    Worker getWorkerById(Long id);
}
