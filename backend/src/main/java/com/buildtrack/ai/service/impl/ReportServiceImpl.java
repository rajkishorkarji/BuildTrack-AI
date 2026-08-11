package com.buildtrack.ai.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.report.ReportCreateRequest;
import com.buildtrack.ai.dto.report.ReportResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.Report;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.*;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {
    private final ReportRepository reportRepository;
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final WorkerRepository workerRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final FinanceRepository financeRepository;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher domainEventPublisher;
    private final ObjectMapper objectMapper;

    @Override @Transactional(readOnly = true)
    public List<ReportResponse> getReports(User user, Long projectId) {
        List<Report> reports;
        if ("SUPER_ADMIN".equals(role(user))) reports = projectId == null ? reportRepository.findAll() : reportRepository.findByProjectIdOrderByGeneratedAtDesc(projectId);
        else {
            if (user.getCompanyId() == null) return List.of();
            if (projectId != null) { Project p = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found")); assertAccess(p,user); reports = reportRepository.findByProjectIdOrderByGeneratedAtDesc(projectId); }
            else reports = reportRepository.findByCompanyIdOrderByGeneratedAtDesc(user.getCompanyId());
        }
        return reports.stream().filter(r -> r.getProject() == null || canAccess(r.getProject(),user)).map(this::toResponse).toList();
    }

    @Override @Transactional
    public ReportResponse createReport(ReportCreateRequest request, User user) {
        String r = role(user);
        if (!List.of("SUPER_ADMIN","COMPANY_ADMIN","PROJECT_MANAGER","SITE_ENGINEER").contains(r)) throw new BadRequestException("Your role cannot generate reports");
        Project project = request.projectId() == null ? null : projectRepository.findById(request.projectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        if (project != null) assertAccess(project,user);
        Company company = project != null ? project.getCompany() : companyFor(user);
        Map<String,Object> summary = buildSummary(request.reportType().trim().toUpperCase(Locale.ROOT), project, company);
        Report report = Report.builder().title(request.title().trim()).reportType(request.reportType().trim().toUpperCase(Locale.ROOT)).summaryJson(write(summary)).generatedBy(fullName(user)).project(project).company(company).build();
        Report saved = reportRepository.save(report);
        realtimePublisher.publishForCompany(company.getId(), "reports", "created", saved.getId());
        domainEventPublisher.publish("REPORT_CREATED", company.getId(), user.getEmail(), "REPORT", saved.getId(), "Report generated: " + saved.getTitle());
        return toResponse(saved);
    }

    private Map<String,Object> buildSummary(String type, Project p, Company c) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("generatedAt", java.time.OffsetDateTime.now().toString());
        m.put("reportType", type);
        if (p != null) {
            m.put("projectId", p.getId()); m.put("projectName", p.getName()); m.put("status", p.getStatus());
            m.put("budget", p.getBudget()); m.put("spent", p.getSpent()); m.put("progressPercentage", p.getProgressPercentage());
            m.put("taskCount", taskRepository.findByProjectId(p.getId()).size());
            m.put("attendanceCount", attendanceRepository.findByProjectIdOrderByCheckInDesc(p.getId()).size());
            m.put("equipmentCount", equipmentRepository.findByProjectId(p.getId()).size());
        } else if (c != null) {
            m.put("companyId", c.getId()); m.put("companyName", c.getName());
            m.put("projectCount", projectRepository.findByCompanyId(c.getId()).size());
            m.put("workerCount", workerRepository.findByCompanyId(c.getId()).size());
            m.put("taskCount", taskRepository.findByProjectCompanyId(c.getId()).size());
            m.put("equipmentCount", equipmentRepository.findByProjectCompanyId(c.getId()).size());
            BigDecimal budget = projectRepository.findByCompanyId(c.getId()).stream().map(Project::getBudget).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
            m.put("portfolioBudget", budget);
        }
        return m;
    }
    private Company companyFor(User user) { if (user.getCompanyId()==null) throw new BadRequestException("Company context is required"); return companyRepository.findById(user.getCompanyId()).orElseThrow(() -> new ResourceNotFoundException("Company not found")); }
    private void assertAccess(Project p, User u) { if ("SUPER_ADMIN".equals(role(u))) return; if (u.getCompanyId()==null || !u.getCompanyId().equals(p.getCompany().getId())) throw new BadRequestException("Project belongs to another company"); if ("COMPANY_ADMIN".equals(role(u))) return; if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(p.getId(),u.getId(),"ACTIVE")) throw new BadRequestException("You are not assigned to this project"); }
    private boolean canAccess(Project p, User u) { try { assertAccess(p,u); return true; } catch (RuntimeException e) { return false; } }
    private String role(User u) { return u.getRoles().stream().findFirst().map(x -> x.getRoleName().toUpperCase(Locale.ROOT)).orElse(""); }
    private String fullName(User u) { return ((u.getFirstName()==null?"":u.getFirstName())+" "+(u.getLastName()==null?"":u.getLastName())).trim(); }
    private String write(Object x) { try { return objectMapper.writeValueAsString(x); } catch (JsonProcessingException e) { throw new BadRequestException("Unable to generate report summary"); } }

    private ReportResponse toResponse(Report r) { return new ReportResponse(r.getId(), r.getProject()==null?null:r.getProject().getId(), r.getProject()==null?null:r.getProject().getName(), r.getTitle(), r.getReportType(), r.getSummaryJson(), r.getGeneratedBy(), r.getGeneratedAt()); }

}
