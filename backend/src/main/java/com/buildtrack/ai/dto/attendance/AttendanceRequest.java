package com.buildtrack.ai.dto.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AttendanceRequest {
    private Long workerId;
    private Long projectId;
    private String status;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
}
