package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.task.TaskCreateRequest;
import com.buildtrack.ai.dto.task.TaskProgressRequest;
import com.buildtrack.ai.dto.task.TaskResponse;
import com.buildtrack.ai.entity.TaskEntity;

import java.util.List;

public interface TaskService {
    List<TaskResponse> getTasksForUser(User user);
    List<TaskResponse> getTasksByProject(Long projectId, User user);
    TaskResponse createTask(TaskCreateRequest request, User actor);
    TaskResponse updateTaskProgress(Long taskId, TaskProgressRequest request, User actor);
    TaskResponse assignTask(Long taskId, Long assigneeUserId, User actor);
}
