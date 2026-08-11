package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.workforce.WorkforceMemberResponse;

import java.util.List;

public interface WorkforceService {
    List<WorkforceMemberResponse> getAccessibleWorkforce(User user);
    WorkforceMemberResponse getMember(Long userId, User actor);
    WorkforceMemberResponse updateStatus(Long userId, boolean enabled, User actor);
    void removeMember(Long userId, User actor);
}
