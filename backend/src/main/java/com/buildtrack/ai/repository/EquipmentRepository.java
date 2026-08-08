package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByProjectId(Long projectId);
    List<Equipment> findByStatus(String status);
    List<Equipment> findByProjectCompanyId(Long companyId);
}
