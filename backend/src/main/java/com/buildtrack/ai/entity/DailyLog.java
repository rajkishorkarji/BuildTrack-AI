package com.buildtrack.ai.entity;

import com.buildtrack.ai.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "daily_logs", indexes = {
    @Index(name = "idx_daily_logs_project_date", columnList = "project_id,log_date DESC"),
    @Index(name = "idx_daily_logs_company_date", columnList = "company_id,log_date DESC")
})
public class DailyLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "task_id")
    private TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(nullable = false, length = 1000)
    private String workSummary;

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(columnDefinition = "TEXT")
    private String safetyNotes;

    private String weather;
    private Integer progressPercentage;

    @Column(nullable = false, length = 32)
    private String status = "SUBMITTED";

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
