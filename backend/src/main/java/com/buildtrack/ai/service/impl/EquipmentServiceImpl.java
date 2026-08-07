package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.repository.EquipmentRepository;
import com.buildtrack.ai.service.EquipmentService;
import com.buildtrack.ai.service.RealtimePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentServiceImpl implements EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private RealtimePublisher realtimePublisher;

    @Override
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    @Override
    public Equipment createEquipment(Equipment equipment) {
        Equipment saved = equipmentRepository.save(equipment);
        realtimePublisher.publish("equipment", "created", saved.getId());
        return saved;
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
        Equipment saved = equipmentRepository.save(eq);
        realtimePublisher.publish("equipment", "updated", saved.getId());
        return saved;
    }
}
