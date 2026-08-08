package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Equipment;
import java.util.List;

public interface EquipmentService {
    List<Equipment> getAllEquipment();
    List<Equipment> getEquipmentByCompany(Long companyId);
    Equipment createEquipment(Equipment equipment);
    Equipment updateStatus(Long id, String status);
}
