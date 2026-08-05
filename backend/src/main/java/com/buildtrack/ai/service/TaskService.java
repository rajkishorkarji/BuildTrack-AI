package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.TaskEntity;
import java.util.List;

public interface TaskService {
    List<TaskEntity> getAllTasks();
    List<TaskEntity> getTasksByProject(Long projectId);
    TaskEntity createTask(TaskEntity task);
    TaskEntity updateTaskProgress(Long taskId, Integer progress, String status);
}
