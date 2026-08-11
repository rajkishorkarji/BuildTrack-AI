package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.repository.FinanceRepository;
import com.buildtrack.ai.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final FinanceRepository financeRepository;

    @Override
    public Map<String, Object> getOverview(Long companyId) {
        BigDecimal total = financeRepository.totalInvoiceValueByCompany(companyId);
        BigDecimal paid = financeRepository.totalPaidByCompany(companyId);
        BigDecimal pending = financeRepository.totalPendingByCompany(companyId);

        return Map.of(
                "totalInvoiceValue", total == null ? BigDecimal.ZERO : total,
                "paid", paid == null ? BigDecimal.ZERO : paid,
                "pending", pending == null ? BigDecimal.ZERO : pending,
                "remaining", (total == null ? BigDecimal.ZERO : total)
                        .subtract(paid == null ? BigDecimal.ZERO : paid)
        );
    }

    @Override
    public List<Finance> getInvoices() {
        return financeRepository.findAll();
    }

    @Override
    public List<Finance> getInvoicesByCompany(Long companyId) {
        return financeRepository.findByProjectCompanyId(companyId);
    }
}
