package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.milestone.MilestoneRequest;
import com.buildtrack.ai.dto.milestone.MilestoneResponse;

import java.util.List;

public interface MilestoneService {
    List<MilestoneResponse> list(User user, Long projectId);
    MilestoneResponse create(MilestoneRequest request, User actor);
    void autoComplete(Long milestoneId);
}
