package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {
    @Query("select a from ProjectAssignment a join fetch a.user u join fetch a.project p where p.id = :projectId and a.status = :status")
    List<ProjectAssignment> findAssignments(@Param("projectId") Long projectId, @Param("status") String status);

    @Query("select a.project from ProjectAssignment a where a.user.id = :userId and a.status = :status")
    List<Project> findProjectsForUser(@Param("userId") Long userId, @Param("status") String status);

    @Query("select a from ProjectAssignment a join fetch a.user u join fetch a.project p where p.company.id = :companyId and a.status = 'ACTIVE' order by p.name asc, u.firstName asc")
    List<ProjectAssignment> findActiveByCompanyId(@Param("companyId") Long companyId);

    Optional<ProjectAssignment> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserIdAndStatus(Long projectId, Long userId, String status);
}
