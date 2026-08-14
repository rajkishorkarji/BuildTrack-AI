package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.finance.FinanceCreateRequest;
import com.buildtrack.ai.entity.Finance;
import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.repository.FinanceRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.service.FinanceService;
import com.buildtrack.ai.service.NotificationService;
import com.buildtrack.ai.service.RealtimePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final FinanceRepository financeRepository;
    private final ProjectRepository projectRepository;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher domainEventPublisher;
    private final NotificationService notificationService;

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

    @Override
    @Transactional
    public Finance createInvoice(FinanceCreateRequest request, User actor) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + request.getProjectId()));

        Finance.InvoiceStatus statusEnum;
        try {
            statusEnum = Finance.InvoiceStatus.valueOf(String.valueOf(request.getStatus()).toUpperCase());
        } catch (Exception e) {
            statusEnum = Finance.InvoiceStatus.PENDING;
        }

        String invNum = request.getInvoiceNumber();
        if (invNum == null || invNum.trim().isEmpty()) {
            invNum = "INV-" + System.currentTimeMillis() % 1000000;
        }

        BigDecimal amount = request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO;
        BigDecimal gst = request.getGstAmount() != null ? request.getGstAmount() : amount.multiply(new BigDecimal("0.18"));

        Finance finance = Finance.builder()
                .project(project)
                .invoiceNumber(invNum)
                .vendorName(request.getVendorName() != null ? request.getVendorName() : actor.getFirstName() + " " + actor.getLastName())
                .category(request.getCategory() != null ? request.getCategory() : "Material & Labor")
                .amount(amount)
                .gstAmount(gst)
                .status(statusEnum)
                .dueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(15))
                .paidAt(statusEnum == Finance.InvoiceStatus.PAID ? LocalDateTime.now() : null)
                .build();

        Finance saved = financeRepository.save(finance);

        if (statusEnum == Finance.InvoiceStatus.PAID) {
            updateProjectSpentAndCheckOverrun(project, amount.add(gst), actor);
        }

        Long companyId = project.getCompany() != null ? project.getCompany().getId() : null;
        if (companyId != null) {
            realtimePublisher.publishForCompany(companyId, "finance", "invoice_created", saved.getId());
        }

        domainEventPublisher.publish("INVOICE_CREATED", companyId, actor.getEmail(), "FINANCE", saved.getId(),
                "Invoice created: " + invNum + " for amount " + amount);

        return saved;
    }

    @Override
    @Transactional
    public Finance updateInvoiceStatus(Long invoiceId, String statusStr, User actor) {
        Finance finance = financeRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        Finance.InvoiceStatus oldStatus = finance.getStatus();
        Finance.InvoiceStatus newStatus;
        try {
            newStatus = Finance.InvoiceStatus.valueOf(String.valueOf(statusStr).toUpperCase());
        } catch (Exception e) {
            newStatus = oldStatus;
        }

        finance.setStatus(newStatus);
        if (newStatus == Finance.InvoiceStatus.PAID && oldStatus != Finance.InvoiceStatus.PAID) {
            finance.setPaidAt(LocalDateTime.now());
            BigDecimal totalAmount = (finance.getAmount() != null ? finance.getAmount() : BigDecimal.ZERO)
                    .add(finance.getGstAmount() != null ? finance.getGstAmount() : BigDecimal.ZERO);
            updateProjectSpentAndCheckOverrun(finance.getProject(), totalAmount, actor);
        }

        Finance saved = financeRepository.save(finance);
        Long companyId = finance.getProject() != null && finance.getProject().getCompany() != null
                ? finance.getProject().getCompany().getId() : null;
        if (companyId != null) {
            realtimePublisher.publishForCompany(companyId, "finance", "invoice_updated", saved.getId());
        }

        return saved;
    }

    private void updateProjectSpentAndCheckOverrun(Project project, BigDecimal addedAmount, User actor) {
        BigDecimal currentSpent = project.getSpent() != null ? project.getSpent() : BigDecimal.ZERO;
        BigDecimal newSpent = currentSpent.add(addedAmount);
        project.setSpent(newSpent);
        projectRepository.save(project);

        BigDecimal budget = project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO;
        if (budget.compareTo(BigDecimal.ZERO) > 0 && newSpent.compareTo(budget) > 0) {
            BigDecimal overrun = newSpent.subtract(budget);
            String title = "COST OVERRUN ALERT: " + project.getName();
            String msg = "Project '" + project.getName() + "' spent ₹" + newSpent + " has exceeded allocated budget of ₹" + budget + " by ₹" + overrun + "!";

            notificationService.broadcast(actor, "COMPANY_ADMIN", title, msg, Notification.NotificationType.ALERT);
            domainEventPublisher.publish("COST_OVERRUN_DETECTED", project.getCompany() != null ? project.getCompany().getId() : null,
                    actor.getEmail(), "PROJECT", project.getId(), msg);
        }
    }
}
