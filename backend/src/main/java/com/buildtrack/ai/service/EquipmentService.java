package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Equipment;
import java.util.List;

public interface EquipmentService {
    List<Equipment> getAllEquipment();
    Equipment updateStatus(Long id, String status);
}
