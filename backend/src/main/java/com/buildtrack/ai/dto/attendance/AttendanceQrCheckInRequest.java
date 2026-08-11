package com.buildtrack.ai.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AttendanceQrCheckInRequest {
    @NotBlank
    private String qrCodeToken;
    private Long projectId;
}
