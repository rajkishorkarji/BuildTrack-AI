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
@Table(name = "site_issues")
public class SiteIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 32)
    private String severity = "HIGH";

    @Column(length = 255)
    private String location;

    @Column(nullable = false, length = 32)
    private String status = "OPEN";

    @Column(name = "reported_by", nullable = false, length = 255)
    private String reportedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (severity == null || severity.isBlank()) severity = "HIGH";
        if (status == null || status.isBlank()) status = "OPEN";
    }
}
