package com.buildtrack.ai.dto.attendance;

import lombok.Data;

@Data
public class AttendanceResponse {
    private Long id;
    private Long workerId;
    private Long projectId;
    private String status;
    private String checkInTime;
}
