package com.buildtrack.ai.entity;

import com.buildtrack.ai.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "material_requests")
public class MaterialRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private TaskEntity task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by_id")
    private User issuedBy;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(name = "required_date", length = 50)
    private String requiredDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null || status.isBlank()) status = "PENDING";
        if (quantity == null) quantity = BigDecimal.ZERO;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @com.fasterxml.jackson.annotation.JsonProperty("materialName")
    public String getMaterialName() {
        return material != null ? material.getName() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("projectName")
    public String getProjectName() {
        if (project != null && project.getName() != null) return project.getName();
        if (material != null && material.getProject() != null) return material.getProject().getName();
        return null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("taskTitle")
    public String getTaskTitle() {
        return task != null ? task.getTitle() : null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("requestedByName")
    public String getRequestedByName() {
        if (requestedBy == null) return null;
        if (requestedBy.getFullName() != null && !requestedBy.getFullName().isBlank()) return requestedBy.getFullName();
        if (requestedBy.getEmail() != null) return requestedBy.getEmail();
        return null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("issuedByName")
    public String getIssuedByName() {
        if (issuedBy == null) return null;
        if (issuedBy.getFullName() != null && !issuedBy.getFullName().isBlank()) return issuedBy.getFullName();
        if (issuedBy.getEmail() != null) return issuedBy.getEmail();
        return null;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("unit")
    public String getUnit() {
        return material != null ? material.getUnit() : null;
    }
}

