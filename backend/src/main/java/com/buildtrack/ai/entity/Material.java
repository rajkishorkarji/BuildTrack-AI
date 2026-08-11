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
@Table(name = "materials",
       uniqueConstraints = @UniqueConstraint(name = "uk_material_project_name", columnNames = {"project_id", "name"}))
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(name = "reorder_level", nullable = false, precision = 14, scale = 3)
    private BigDecimal reorderLevel;

    @Column(name = "unit_cost", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitCost;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void defaults() {
        createdAt = LocalDateTime.now();
        if (quantity == null) quantity = BigDecimal.ZERO;
        if (reorderLevel == null) reorderLevel = BigDecimal.ZERO;
        if (unitCost == null) unitCost = BigDecimal.ZERO;
        if (status == null || status.isBlank()) status = "AVAILABLE";
    }
}
