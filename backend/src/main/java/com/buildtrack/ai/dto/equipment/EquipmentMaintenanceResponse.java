package com.buildtrack.ai.dto.equipment;

import com.buildtrack.ai.entity.EquipmentMaintenance;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EquipmentMaintenanceResponse(
        Long id,
        Long equipmentId,
        String equipmentName,
        LocalDate serviceDate,
        LocalDate nextDueDate,
        String serviceType,
        BigDecimal cost,
        String notes,
        String status
) {
    public static EquipmentMaintenanceResponse from(EquipmentMaintenance m) {
        return new EquipmentMaintenanceResponse(
                m.getId(),
                m.getEquipment() != null ? m.getEquipment().getId() : null,
                m.getEquipment() != null ? m.getEquipment().getName() : null,
                m.getServiceDate(),
                m.getNextDueDate(),
                m.getServiceType(),
                m.getCost(),
                m.getNotes(),
                m.getStatus()
        );
    }
}
