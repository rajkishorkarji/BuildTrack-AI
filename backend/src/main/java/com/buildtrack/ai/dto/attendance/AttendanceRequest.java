package com.buildtrack.ai.dto.attendance;

import lombok.Data;

@Data
public class AttendanceRequest {
    private Long workerId;
    private Long projectId;
    private String status;
}
