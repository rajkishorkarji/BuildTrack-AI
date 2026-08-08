package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.repository.TaskRepository;
import com.buildtrack.ai.service.TaskService;
import com.buildtrack.ai.service.RealtimePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;


    @Autowired
    private RealtimePublisher realtimePublisher;
    @Override
    public List<TaskEntity> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public List<TaskEntity> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Override
    public List<TaskEntity> getTasksByCompany(Long companyId) {
        return taskRepository.findByProjectCompanyId(companyId);
    }

    @Override
    public TaskEntity createTask(TaskEntity task) {
        if (task.getCompletionPercentage() == null) {
            task.setCompletionPercentage(0);
        }
        if (task.getStatus() == null) {
            task.setStatus("TODO");
        }
        TaskEntity saved = taskRepository.save(task);
        realtimePublisher.publish("tasks", "created", saved.getId());
        return saved;
    }

    @Override
    public TaskEntity updateTaskProgress(Long taskId, Integer progress, String status) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        if (progress != null) {
            task.setCompletionPercentage(progress);
            if (progress >= 100) {
                task.setStatus("COMPLETED");
            }
        }
        if (status != null && !status.isBlank()) {
            task.setStatus(status);
        }
        TaskEntity saved = taskRepository.save(task);
        realtimePublisher.publish("tasks", "updated", saved.getId());
        return saved;
    }
}
