package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.EquipmentMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentMaintenanceRepository extends JpaRepository<EquipmentMaintenance, Long> {
    List<EquipmentMaintenance> findByEquipmentIdOrderByServiceDateDesc(Long equipmentId);
}
