package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.TaskEntity;
import com.buildtrack.ai.repository.TaskRepository;
import com.buildtrack.ai.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public List<TaskEntity> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public List<TaskEntity> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Override
    public TaskEntity createTask(TaskEntity task) {
        if (task.getCompletionPercentage() == null) {
            task.setCompletionPercentage(0);
        }
        if (task.getStatus() == null) {
            task.setStatus("TODO");
        }
        return taskRepository.save(task);
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
        return taskRepository.save(task);
    }
}
