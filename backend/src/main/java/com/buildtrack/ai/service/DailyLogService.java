package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.dailylog.DailyLogRequest;
import com.buildtrack.ai.dto.dailylog.DailyLogResponse;
import java.util.List;

public interface DailyLogService {
    List<DailyLogResponse> getLogs(User user, Long projectId);
    DailyLogResponse create(DailyLogRequest request, User user);
    DailyLogResponse approve(Long id, User user);
    DailyLogResponse reject(Long id, User user);
}
