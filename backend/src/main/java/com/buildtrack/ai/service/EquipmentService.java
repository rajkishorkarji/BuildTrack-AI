package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.entity.EquipmentMaintenance;

import java.util.List;

public interface EquipmentService {
    List<Equipment> getVisibleEquipment();
    Equipment createEquipment(Equipment equipment);
    Equipment updateStatus(Long id, String status);
    Equipment assign(Long equipmentId, Long userId);
    EquipmentMaintenance scheduleMaintenance(Long equipmentId, EquipmentMaintenance maintenance);
    List<EquipmentMaintenance> maintenanceHistory(Long equipmentId);
}
