package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.issue.IssueRequest;
import com.buildtrack.ai.dto.issue.IssueResponse;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.SiteIssue;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.SiteIssueRepository;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.service.SiteIssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SiteIssueServiceImpl implements SiteIssueService {
    private final SiteIssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher events;

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> list(User user) {
        List<SiteIssue> issues;
        if (isSuper(user)) {
            issues = issueRepository.findAll().stream()
                    .sorted(java.util.Comparator.comparing(SiteIssue::getCreatedAt).reversed())
                    .toList();
        } else if (isCompanyAdmin(user)) {
            issues = issueRepository.findByProjectCompanyIdOrderByCreatedAtDesc(user.getCompanyId());
        } else {
            List<Long> projectIds = assignmentRepository.findProjectsForUser(user.getId(), "ACTIVE")
                    .stream().map(Project::getId).toList();
            issues = projectIds.isEmpty() ? List.of() : issueRepository.findByProjectIdInOrderByCreatedAtDesc(projectIds);
        }
        return issues.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public IssueResponse create(IssueRequest request, User user) {
        requireCanWrite(user);
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, user);
        SiteIssue issue = SiteIssue.builder()
                .project(project)
                .title(request.title().trim())
                .description(request.description())
                .severity(normalize(request.severity(), "HIGH"))
                .location(request.location())
                .status(normalize(request.status(), "OPEN"))
                .reportedBy(fullName(user))
                .build();
        SiteIssue saved = issueRepository.save(issue);
        events.publish("SITE_ISSUE_CREATED", project.getCompany().getId(), user.getEmail(), "SITE_ISSUE", saved.getId(), "Site issue created: " + saved.getTitle());
        realtimePublisher.publishForCompany(project.getCompany().getId(), "issues", "created", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public IssueResponse updateStatus(Long id, String status, User user) {
        requireCanWrite(user);
        SiteIssue issue = issueRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Issue not found"));
        assertProjectAccess(issue.getProject(), user);
        issue.setStatus(normalize(status, "OPEN"));
        SiteIssue saved = issueRepository.save(issue);
        events.publish("SITE_ISSUE_UPDATED", saved.getProject().getCompany().getId(), user.getEmail(), "SITE_ISSUE", saved.getId(), "Site issue status updated: " + saved.getStatus());
        realtimePublisher.publishForCompany(saved.getProject().getCompany().getId(), "issues", "updated", saved.getId());
        return toResponse(saved);
    }

    private void requireCanWrite(User user) {
        String role = role(user);
        if (!("SUPER_ADMIN".equals(role) || "COMPANY_ADMIN".equals(role) || "PROJECT_MANAGER".equals(role)
                || "SITE_ENGINEER".equals(role) || "CONTRACTOR".equals(role))) {
            throw new BadRequestException("Your role cannot manage site issues");
        }
    }

    private void assertProjectAccess(Project project, User user) {
        if (isSuper(user)) return;
        if (user.getCompanyId() == null || !user.getCompanyId().equals(project.getCompany().getId())) {
            throw new BadRequestException("Project belongs to another company");
        }
        if (!isCompanyAdmin(user) && !assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), user.getId(), "ACTIVE")) {
            throw new BadRequestException("You are not assigned to this project");
        }
    }

    private boolean isSuper(User u) { return "SUPER_ADMIN".equals(role(u)); }
    private boolean isCompanyAdmin(User u) { return "COMPANY_ADMIN".equals(role(u)); }
    private String role(User u) { return u.getRoles().stream().findFirst().map(r -> r.getRoleName().toUpperCase(Locale.ROOT)).orElse(""); }
    private String fullName(User u) { return ((u.getFirstName() == null ? "" : u.getFirstName()) + " " + (u.getLastName() == null ? "" : u.getLastName())).trim(); }
    private String normalize(String value, String fallback) { return value == null || value.isBlank() ? fallback : value.trim().toUpperCase(Locale.ROOT).replace(' ', '_'); }
    private IssueResponse toResponse(SiteIssue i) { return new IssueResponse(i.getId(), i.getProject().getId(), i.getProject().getName(), i.getTitle(), i.getDescription(), i.getSeverity(), i.getLocation(), i.getStatus(), i.getReportedBy(), i.getCreatedAt()); }
}
