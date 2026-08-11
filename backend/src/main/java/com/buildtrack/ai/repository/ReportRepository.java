package com.buildtrack.ai.repository;
import com.buildtrack.ai.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByCompanyIdOrderByGeneratedAtDesc(Long companyId);
    List<Report> findByProjectIdOrderByGeneratedAtDesc(Long projectId);
}
