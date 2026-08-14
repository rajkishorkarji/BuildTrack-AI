package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.finance.FinanceCreateRequest;
import com.buildtrack.ai.entity.Finance;

import java.util.List;
import java.util.Map;

public interface FinanceService {
    Map<String, Object> getOverview(Long companyId);
    List<Finance> getInvoices();
    List<Finance> getInvoicesByCompany(Long companyId);
    Finance createInvoice(FinanceCreateRequest request, User actor);
    Finance updateInvoiceStatus(Long invoiceId, String status, User actor);
}
