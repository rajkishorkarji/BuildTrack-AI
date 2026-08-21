package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Material;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    @EntityGraph(attributePaths = {"project"})
    List<Material> findByProjectIdOrderByNameAsc(Long projectId);

    @EntityGraph(attributePaths = {"project"})
    List<Material> findByProjectCompanyIdOrderByNameAsc(Long companyId);

    @Override
    @EntityGraph(attributePaths = {"project"})
    List<Material> findAll();

    @Override
    @EntityGraph(attributePaths = {"project"})
    Optional<Material> findById(Long id);
}


