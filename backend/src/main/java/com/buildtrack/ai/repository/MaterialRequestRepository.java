package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.MaterialRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {
    @EntityGraph(attributePaths = {"material", "material.project", "project", "task", "requestedBy", "issuedBy"})
    List<MaterialRequest> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    @EntityGraph(attributePaths = {"material", "material.project", "project", "task", "requestedBy", "issuedBy"})
    List<MaterialRequest> findByProjectCompanyIdOrderByCreatedAtDesc(Long companyId);

    @EntityGraph(attributePaths = {"material", "material.project", "project", "task", "requestedBy", "issuedBy"})
    List<MaterialRequest> findByRequestedByIdOrderByCreatedAtDesc(Long userId);

    @Override
    @EntityGraph(attributePaths = {"material", "material.project", "project", "task", "requestedBy", "issuedBy"})
    List<MaterialRequest> findAll();

    @Override
    @EntityGraph(attributePaths = {"material", "material.project", "project", "task", "requestedBy", "issuedBy"})
    Optional<MaterialRequest> findById(Long id);
}


