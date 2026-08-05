package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Finance;
import java.util.List;
import java.util.Map;

public interface FinanceService {
    Map<String, String> getOverview();
    List<Finance> getInvoices();
}
