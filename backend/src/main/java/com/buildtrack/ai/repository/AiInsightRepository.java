package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, Long> {
    List<AiInsight> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<AiInsight> findByProjectCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<AiInsight> findAllByOrderByCreatedAtDesc();
    List<AiInsight> findByProjectIdAndInsightTypeOrderByCreatedAtDesc(Long projectId, String insightType);
}
