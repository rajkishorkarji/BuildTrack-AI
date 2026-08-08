package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.repository.FinanceRepository;
import com.buildtrack.ai.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FinanceServiceImpl implements FinanceService {

    @Autowired
    private FinanceRepository financeRepository;

    @Override
    public Map<String, String> getOverview() {
        return Map.of(
            "totalBudget", "₹150.0 Cr",
            "disbursed", "₹84.2 Cr",
            "pendingInvoices", "₹12.4 Cr",
            "remaining", "₹53.4 Cr"
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
