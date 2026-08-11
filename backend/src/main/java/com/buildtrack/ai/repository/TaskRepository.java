package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
    List<TaskEntity> findByProjectId(Long projectId);
    List<TaskEntity> findByStatus(String status);
    List<TaskEntity> findByProjectCompanyId(Long companyId);

    @Query("select t from TaskEntity t where t.assignedUser.id = :userId order by t.dueDate asc, t.id desc")
    List<TaskEntity> findAssignedToUser(@Param("userId") Long userId);

    @Query("select t from TaskEntity t where t.project.id in (select a.project.id from ProjectAssignment a where a.user.id = :userId and a.status = 'ACTIVE') order by t.dueDate asc, t.id desc")
    List<TaskEntity> findForAssignedProjects(@Param("userId") Long userId);
}
