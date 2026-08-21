package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.entity.ProjectAssignment;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private static final List<String> ASSIGNABLE_ROLES = List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR", "WORKER");

    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final ProjectAssignmentRepository assignmentRepository;

    public List<Project> getAllProjects() { return projectRepository.findAll(); }

    public List<Project> getProjectsForUser(User user) {
        if ("SUPER_ADMIN".equalsIgnoreCase(primaryRole(user))) return getAllProjects();
        if (user.getCompanyId() == null) return List.of();
        if ("COMPANY_ADMIN".equalsIgnoreCase(primaryRole(user)) || "SITE_ENGINEER".equalsIgnoreCase(primaryRole(user)) || "PROJECT_MANAGER".equalsIgnoreCase(primaryRole(user))) {
            return projectRepository.findByCompanyId(user.getCompanyId());
        }
        List<Project> assigned = assignmentRepository.findProjectsForUser(user.getId(), "ACTIVE");
        return assigned.isEmpty() ? projectRepository.findByCompanyId(user.getCompanyId()) : assigned;
    }

    public Project getProjectForUser(Long projectId, User user) {
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, user);
        return project;
    }

    @Transactional
    public Project create(Long companyId, com.buildtrack.ai.dto.project.ProjectCreateRequest request) {
        Company company = companyRepository.findById(companyId).orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        Project p = new Project();
        p.setCompany(company);
        p.setName(request.getName().trim());
        p.setCode(normalizeCode(request.getCode(), request.getName()));
        p.setLocation(request.getLocation());
        p.setDescription(request.getDescription());
        p.setBudget(request.getBudget());
        p.setStartDate(request.getStartDate());
        p.setEstEndDate(request.getEstEndDate());
        p.setSpent(java.math.BigDecimal.ZERO);
        p.setProgressPercentage(0);
        p.setStatus(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus().trim().toUpperCase(Locale.ROOT) : "PLANNED");
        return projectRepository.save(p);
    }

    @Transactional
    public Project update(Long projectId, com.buildtrack.ai.dto.project.ProjectCreateRequest request, User user) {
        Project p = getProjectForUser(projectId, user);
        if (!"COMPANY_ADMIN".equalsIgnoreCase(primaryRole(user)) && !"SUPER_ADMIN".equalsIgnoreCase(primaryRole(user))) {
            throw new BadRequestException("Only Company Admin or Super Admin can change project master data");
        }
        if (request.getName() != null && !request.getName().isBlank()) p.setName(request.getName().trim());
        if (request.getCode() != null && !request.getCode().isBlank()) p.setCode(request.getCode().trim().toUpperCase(Locale.ROOT));
        p.setLocation(request.getLocation()); p.setDescription(request.getDescription());
        if (request.getBudget() != null) p.setBudget(request.getBudget());
        if (request.getStatus() != null && !request.getStatus().isBlank()) p.setStatus(request.getStatus().trim().toUpperCase(Locale.ROOT));
        p.setStartDate(request.getStartDate()); p.setEstEndDate(request.getEstEndDate());
        return projectRepository.save(p);
    }

    @Transactional
    public Project updateProgress(Long projectId, Integer progressPercentage, User user) {
        Project p = getProjectForUser(projectId, user);
        if (progressPercentage != null) {
            p.setProgressPercentage(Math.min(100, Math.max(0, progressPercentage)));
        }
        return projectRepository.save(p);
    }

    @Transactional
    public void delete(Long projectId, User user) {
        Project p = getProjectForUser(projectId, user);
        if (!"COMPANY_ADMIN".equalsIgnoreCase(primaryRole(user)) && !"SUPER_ADMIN".equalsIgnoreCase(primaryRole(user)))
            throw new BadRequestException("Only Company Admin or Super Admin can delete projects");
        projectRepository.delete(p);
    }

    @Transactional
    public ProjectAssignment assign(Long projectId, Long userId, String role, User actor) {
        Project project = getProjectForUser(projectId, actor);
        if (!userHasRole(actor, "COMPANY_ADMIN") && !userHasRole(actor, "SUPER_ADMIN"))
            throw new BadRequestException("Only Company Admin or Super Admin can assign project personnel");
        String normalizedRole = role.toUpperCase(Locale.ROOT);
        if (!ASSIGNABLE_ROLES.contains(normalizedRole)) throw new BadRequestException("Invalid project assignment role");
        User assignee = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!project.getCompany().getId().equals(assignee.getCompanyId())) throw new BadRequestException("User belongs to another company");
        if (!userHasRole(assignee, normalizedRole)) throw new BadRequestException("User does not have the selected role");
        ProjectAssignment a = assignmentRepository.findByProjectIdAndUserId(projectId, userId).orElseGet(ProjectAssignment::new);
        a.setProject(project); a.setUser(assignee); a.setAssignmentRole(normalizedRole); a.setStatus("ACTIVE");
        return assignmentRepository.save(a);
    }

    @Transactional
    public void unassign(Long projectId, Long userId, User actor) {
        Project project = getProjectForUser(projectId, actor);
        if (!userHasRole(actor, "COMPANY_ADMIN") && !userHasRole(actor, "SUPER_ADMIN"))
            throw new BadRequestException("Only Company Admin or Super Admin can remove project assignments");
        ProjectAssignment a = assignmentRepository.findByProjectIdAndUserId(projectId, userId).orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        if (!project.getCompany().getId().equals(a.getUser().getCompanyId())) throw new BadRequestException("Invalid tenant assignment");
        assignmentRepository.delete(a);
    }

    public List<ProjectAssignment> assignments(Long projectId, User user) {
        getProjectForUser(projectId, user);
        return assignmentRepository.findAssignments(projectId, "ACTIVE");
    }

    public List<User> eligibleUsers(Long companyId, String role) {
        String r = role == null ? "WORKER" : role.toUpperCase(Locale.ROOT);
        if (!ASSIGNABLE_ROLES.contains(r)) throw new BadRequestException("Invalid role");
        return userRepository.findEnabledByCompanyAndRole(companyId, r);
    }

    private void assertProjectAccess(Project project, User user) {
        if (userHasRole(user, "SUPER_ADMIN")) return;
        if (user.getCompanyId() == null || !user.getCompanyId().equals(project.getCompany().getId()))
            throw new BadRequestException("You do not have access to this project");
        if (userHasRole(user, "COMPANY_ADMIN") || userHasRole(user, "SITE_ENGINEER") || userHasRole(user, "PROJECT_MANAGER")) return;
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(project.getId(), user.getId(), "ACTIVE"))
            throw new BadRequestException("You are not assigned to this project");
    }

    private boolean userHasRole(User user, String role) { return user.getRoles().stream().anyMatch(r -> role.equalsIgnoreCase(r.getRoleName())); }
    private String primaryRole(User user) { return user.getRoles().stream().findFirst().map(r -> r.getRoleName()).orElse(""); }
    private String normalizeCode(String code, String name) {
        String base = (code == null || code.isBlank() ? name.replaceAll("[^A-Za-z0-9]+", "-") : code).toUpperCase(Locale.ROOT);
        return base.length() > 60 ? base.substring(0, 60) : base;
    }
}
