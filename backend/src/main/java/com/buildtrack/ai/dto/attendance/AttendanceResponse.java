package com.buildtrack.ai.dto.attendance;

import com.buildtrack.ai.entity.Attendance;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AttendanceResponse {
    private Long id;
    private Long workerId;
    private String workerName;
    private Long projectId;
    private String projectName;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private BigDecimal hoursWorked;
    private Attendance.AttendanceStatus status;
    private String verificationStatus;
    private String verifiedBy;
    private LocalDateTime createdAt;

    public static AttendanceResponse from(Attendance a) {
        return AttendanceResponse.builder()
                .id(a.getId())
                .workerId(a.getWorker() == null ? null : a.getWorker().getId())
                .workerName(a.getWorker() == null ? null : a.getWorker().getFullName())
                .projectId(a.getProject() == null ? null : a.getProject().getId())
                .projectName(a.getProject() == null ? null : a.getProject().getName())
                .checkIn(a.getCheckIn())
                .checkOut(a.getCheckOut())
                .hoursWorked(a.getHoursWorked())
                .status(a.getStatus())
                .verificationStatus(a.getVerificationStatus())
                .verifiedBy(a.getVerifiedBy())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
