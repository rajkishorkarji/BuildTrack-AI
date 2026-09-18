package com.buildtrack.ai.service;

import com.buildtrack.ai.dto.attendance.DynamicQrResponse;

public interface DynamicQrService {
    DynamicQrResponse generateProjectDynamicToken(Long projectId);
    boolean validateDynamicToken(String token, Long projectId);
    boolean isDynamicToken(String token);
}