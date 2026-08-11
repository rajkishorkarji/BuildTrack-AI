package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Finance;

import java.util.List;
import java.util.Map;

public interface FinanceService {
    Map<String, Object> getOverview(Long companyId);
    List<Finance> getInvoices();
    List<Finance> getInvoicesByCompany(Long companyId);
}
