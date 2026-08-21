package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByProjectId(Long projectId);
    List<Equipment> findByProjectCompanyId(Long companyId);
    List<Equipment> findByAssignedUserId(Long userId);

    @Query("select distinct e from Equipment e left join e.project p left join e.assignedUser u where p.company.id = :companyId or u.companyId = :companyId")
    List<Equipment> findByCompanyId(@Param("companyId") Long companyId);

    @Query("select distinct e from Equipment e left join e.project p left join e.assignedUser u where u.id = :userId or p.id in :projectIds")
    List<Equipment> findByUserIdOrProjectIds(@Param("userId") Long userId, @Param("projectIds") List<Long> projectIds);

    @Query("select e from Equipment e where e.project.id in :projectIds")
    List<Equipment> findByProjectIds(@Param("projectIds") List<Long> projectIds);

    @Query("select e from Equipment e where e.project.company.id = :companyId and e.status = :status")
    List<Equipment> findByCompanyIdAndStatus(@Param("companyId") Long companyId,
                                              @Param("status") Equipment.EquipmentStatus status);
}
