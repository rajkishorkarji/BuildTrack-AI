package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.DailyLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    List<DailyLog> findByCompanyIdOrderByLogDateDescCreatedAtDesc(Long companyId);
    List<DailyLog> findByProjectIdOrderByLogDateDescCreatedAtDesc(Long projectId);
    List<DailyLog> findByProjectCompanyIdAndProjectIdOrderByLogDateDescCreatedAtDesc(Long companyId, Long projectId);
    List<DailyLog> findByProjectIdAndCreatedByIdOrderByLogDateDescCreatedAtDesc(Long projectId, Long userId);
}
