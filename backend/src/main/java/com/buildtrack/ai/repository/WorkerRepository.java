package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByStatus(String status);
    List<Worker> findBySkillTrade(String skillTrade);
    List<Worker> findByCompanyId(Long companyId);
}
