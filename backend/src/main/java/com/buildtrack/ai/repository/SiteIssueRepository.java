package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.SiteIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SiteIssueRepository extends JpaRepository<SiteIssue, Long> {
    List<SiteIssue> findByProjectCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<SiteIssue> findByProjectIdInOrderByCreatedAtDesc(List<Long> projectIds);
}
