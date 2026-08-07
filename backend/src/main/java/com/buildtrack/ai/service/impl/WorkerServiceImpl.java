package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Worker;
import com.buildtrack.ai.repository.WorkerRepository;
import com.buildtrack.ai.service.WorkerService;
import com.buildtrack.ai.service.RealtimePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkerServiceImpl implements WorkerService {

    @Autowired
    private WorkerRepository workerRepository;


    @Autowired
    private RealtimePublisher realtimePublisher;
    @Override
    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    @Override
    public Worker createWorker(Worker worker) {
        if (worker.getStatus() == null) {
            worker.setStatus(Worker.WorkerStatus.ACTIVE);
        }
        Worker saved = workerRepository.save(worker);
        realtimePublisher.publish("workers", "created", saved.getId());
        return saved;
    }

    @Override
    public Worker getWorkerById(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found with id: " + id));
    }
}
