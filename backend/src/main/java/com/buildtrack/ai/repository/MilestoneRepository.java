package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    @Query("select m from Milestone m where m.project.id = :projectId order by m.id asc")
    List<Milestone> findByProjectId(@Param("projectId") Long projectId);

    @Query("select m from Milestone m where m.project.company.id = :companyId order by m.project.name asc, m.id asc")
    List<Milestone> findByCompanyId(@Param("companyId") Long companyId);
}
