package com.buildtrack.ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker worker;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false)
    private LocalDateTime checkIn;

    private LocalDateTime checkOut;

    private BigDecimal hoursWorked;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    private String verificationStatus = "PENDING";
    private String verifiedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (checkIn == null) checkIn = LocalDateTime.now();
        if (status == null) status = AttendanceStatus.PRESENT;
    }

    public enum AttendanceStatus {
        PRESENT, LATE, ABSENT, OVERTIME
    }

    @com.fasterxml.jackson.annotation.JsonProperty("durationCategory")
    public String getDurationCategory() {
        if (checkOut == null) return "SESSION_OPEN";
        if (hoursWorked == null) return "EARLY_LEAVE";
        double h = hoursWorked.doubleValue();
        if (h < 7.95) return "EARLY_LEAVE";
        if (h <= 8.05) return "FULL_DAY";
        return "OVERTIME";
    }

    @com.fasterxml.jackson.annotation.JsonProperty("overtimeHours")
    public BigDecimal getOvertimeHours() {
        if (hoursWorked == null) return BigDecimal.ZERO;
        double h = hoursWorked.doubleValue();
        if (h > 8.0) {
            return BigDecimal.valueOf(h - 8.0).setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("workerName")
    public String getWorkerName() {
        return worker != null ? worker.getFullName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("projectName")
    public String getProjectName() {
        return project != null ? project.getName() : null;
    }
}

