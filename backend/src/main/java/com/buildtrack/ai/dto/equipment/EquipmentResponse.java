package com.buildtrack.ai.dto.equipment;

import com.buildtrack.ai.entity.Equipment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EquipmentResponse(
        Long id,
        String name,
        String category,
        String serialNumber,
        String status,
        BigDecimal dailyCost,
        LocalDate lastServicedDate,
        LocalDate nextServiceDue,
        LocalDateTime createdAt,
        Long projectId,
        String projectName,
        Long assignedUserId,
        String assignedUserName
) {
    public static EquipmentResponse from(Equipment e) {
        return new EquipmentResponse(
                e.getId(),
                e.getName(),
                e.getCategory(),
                e.getSerialNumber(),
                e.getStatus() != null ? e.getStatus().name() : null,
                e.getDailyCost(),
                e.getLastServicedDate(),
                e.getNextServiceDue(),
                e.getCreatedAt(),
                e.getProject() != null ? e.getProject().getId() : null,
                e.getProject() != null ? e.getProject().getName() : null,
                e.getAssignedUser() != null ? e.getAssignedUser().getId() : null,
                e.getAssignedUser() != null
                        ? (e.getAssignedUser().getFirstName() + " " + e.getAssignedUser().getLastName()).trim()
                        : null
        );
    }
}
