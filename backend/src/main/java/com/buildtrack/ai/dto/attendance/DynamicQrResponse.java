package com.buildtrack.ai.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DynamicQrResponse {
    private String token;
    private Long projectId;
    private String projectName;
    private int expiresInSeconds;
    private int refreshIntervalSeconds;
    private long timestamp;
}