package com.buildtrack.ai.entity;

import com.buildtrack.ai.auth.entity.User;
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
@Table(name = "workers")
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String phone;

    @Column(nullable = false)
    private String skillTrade;

    @Column(nullable = false)
    private BigDecimal dailyWage;

    @Column(nullable = false, unique = true)
    private String qrCodeToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkerStatus status;

    @ManyToOne
    @JoinColumn(name = "assigned_project_id")
    private Project assignedProject;

    @Column(name = "company_id")
    private Long companyId;

    private String contractorName;
    private String siteEngineerName;
    private String assignmentType = "DIRECT_PROJECT";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = WorkerStatus.ACTIVE;
        if (dailyWage == null) dailyWage = BigDecimal.ZERO;
    }

    public enum WorkerStatus {
        ACTIVE, ON_LEAVE, INACTIVE
    }
}
