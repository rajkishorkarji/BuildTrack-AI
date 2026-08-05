package com.buildtrack.ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String reportType; // REVENUE, WORKER_ANALYTICS, RESOURCE_UTILIZATION, PROJECT_COMPLETION

    @Column(columnDefinition = "TEXT")
    private String summaryJson;

    @Column(nullable = false)
    private String generatedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @PrePersist
    void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
