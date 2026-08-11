package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FinanceRepository extends JpaRepository<Finance, Long> {

    List<Finance> findByProjectId(Long projectId);
    List<Finance> findByProjectCompanyId(Long companyId);

    @Query("select coalesce(sum(f.amount + f.gstAmount), 0) from Finance f where f.project.company.id = :companyId")
    BigDecimal totalInvoiceValueByCompany(@Param("companyId") Long companyId);

    @Query("select coalesce(sum(f.amount + f.gstAmount), 0) from Finance f where f.project.company.id = :companyId and f.status = com.buildtrack.ai.entity.Finance.InvoiceStatus.PAID")
    BigDecimal totalPaidByCompany(@Param("companyId") Long companyId);

    @Query("select coalesce(sum(f.amount + f.gstAmount), 0) from Finance f where f.project.company.id = :companyId and f.status in (com.buildtrack.ai.entity.Finance.InvoiceStatus.PENDING, com.buildtrack.ai.entity.Finance.InvoiceStatus.APPROVED)")
    BigDecimal totalPendingByCompany(@Param("companyId") Long companyId);
}
