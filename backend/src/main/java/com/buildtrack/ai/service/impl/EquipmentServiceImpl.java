package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.repository.EquipmentRepository;
import com.buildtrack.ai.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Override
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Override
    public Equipment updateStatus(Long id, String statusStr) {
        Equipment eq = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found with id: " + id));
        try {
            eq.setStatus(Equipment.EquipmentStatus.valueOf(statusStr.toUpperCase()));
        } catch (Exception e) {
            eq.setStatus(Equipment.EquipmentStatus.OPERATIONAL);
        }
        return equipmentRepository.save(eq);
    }
}
