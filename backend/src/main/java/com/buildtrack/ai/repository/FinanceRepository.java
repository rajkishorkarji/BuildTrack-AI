package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FinanceRepository extends JpaRepository<Finance, Long> {
    List<Finance> findByProjectId(Long projectId);
    List<Finance> findByStatus(String status);
}
