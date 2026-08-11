package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.workforce.WorkforceMemberResponse;
import com.buildtrack.ai.entity.ProjectAssignment;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.service.WorkforceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkforceServiceImpl implements WorkforceService {
    private static final List<String> PERSONNEL_ROLES = List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR", "WORKER");

    private final UserRepository userRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final ProjectService projectService;
    private final com.buildtrack.ai.repository.CompanyRepository companyRepository;

    @Override
    public List<WorkforceMemberResponse> getAccessibleWorkforce(User actor) {
        List<User> users;
        String role = primaryRole(actor);
        if ("SUPER_ADMIN".equals(role)) {
            users = userRepository.findAll().stream().filter(u -> hasPersonnelRole(u)).toList();
        } else if ("COMPANY_ADMIN".equals(role)) {
            users = userRepository.findByCompanyId(actor.getCompanyId()).stream().filter(u -> hasPersonnelRole(u)).toList();
        } else {
            users = assignmentRepository.findProjectsForUser(actor.getId(), "ACTIVE").stream()
                    .flatMap(project -> assignmentRepository.findAssignments(project.getId(), "ACTIVE").stream())
                    .map(ProjectAssignment::getUser)
                    .filter(this::hasPersonnelRole)
                    .distinct().toList();
        }
        return users.stream().map(u -> toResponse(u)).toList();
    }

    @Override
    public WorkforceMemberResponse getMember(Long userId, User actor) {
        User target = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Workforce member not found"));
        String actorRole = primaryRole(actor);
        if (!"SUPER_ADMIN".equals(actorRole)) {
            if (!actor.getCompanyId().equals(target.getCompanyId())) throw new IllegalArgumentException("Member belongs to another company");
            if (!"COMPANY_ADMIN".equals(actorRole) && assignmentRepository.findProjectsForUser(actor.getId(), "ACTIVE").stream()
                    .noneMatch(p -> assignmentRepository.existsByProjectIdAndUserIdAndStatus(p.getId(), target.getId(), "ACTIVE"))) {
                throw new IllegalArgumentException("You do not have access to this workforce member");
            }
        }
        return toResponse(target);
    }

    @Override
    @Transactional
    public WorkforceMemberResponse updateStatus(Long userId, boolean enabled, User actor) {
        String actorRole = primaryRole(actor);
        if (!"COMPANY_ADMIN".equals(actorRole) && !"SUPER_ADMIN".equals(actorRole)) {
            throw new IllegalArgumentException("Only Company Admin or Super Admin can change personnel status");
        }
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Workforce member not found"));

        if (!"SUPER_ADMIN".equals(actorRole) && !actor.getCompanyId().equals(target.getCompanyId())) {
            throw new IllegalArgumentException("Member belongs to another company");
        }
        if (actor.getId().equals(target.getId())) {
            throw new IllegalArgumentException("You cannot suspend yourself");
        }

        target.setEnabled(enabled);
        User saved = userRepository.save(target);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void removeMember(Long userId, User actor) {
        String actorRole = primaryRole(actor);
        if (!"COMPANY_ADMIN".equals(actorRole) && !"SUPER_ADMIN".equals(actorRole)) {
            throw new IllegalArgumentException("Only Company Admin or Super Admin can remove personnel");
        }
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Workforce member not found"));

        if (!"SUPER_ADMIN".equals(actorRole) && !actor.getCompanyId().equals(target.getCompanyId())) {
            throw new IllegalArgumentException("Member belongs to another company");
        }
        if (actor.getId().equals(target.getId())) {
            throw new IllegalArgumentException("You cannot remove yourself");
        }

        // Delete project assignments for this user
        List<ProjectAssignment> assignments = assignmentRepository.findActiveByCompanyId(target.getCompanyId())
                .stream()
                .filter(a -> a.getUser().getId().equals(target.getId()))
                .toList();
        assignmentRepository.deleteAll(assignments);

        userRepository.delete(target);
    }

    private WorkforceMemberResponse toResponse(User u) {
        List<WorkforceMemberResponse.ProjectAssignmentItem> projects = new ArrayList<>();
        String mainProjectName = null;
        if (u.getCompanyId() != null) {
            for (ProjectAssignment a : assignmentRepository.findActiveByCompanyId(u.getCompanyId())) {
                if (a.getUser().getId().equals(u.getId())) {
                    projects.add(new WorkforceMemberResponse.ProjectAssignmentItem(a.getProject().getId(), a.getProject().getName(), a.getAssignmentRole()));
                    if (mainProjectName == null) {
                        mainProjectName = a.getProject().getName();
                    }
                }
            }
        }

        String companyName = "Platform";
        if (u.getCompanyId() != null) {
            companyName = companyRepository.findById(u.getCompanyId())
                    .map(com.buildtrack.ai.entity.Company::getName).orElse("Platform");
        }

        return new WorkforceMemberResponse(
                u.getId(),
                fullName(u),
                u.getEmail(),
                u.getPhone(),
                primaryRole(u),
                u.isEnabled(),
                u.getCompanyId(),
                companyName,
                mainProjectName,
                projects
        );
    }

    private boolean hasPersonnelRole(User u) {
        return u.getRoles().stream().anyMatch(r -> PERSONNEL_ROLES.contains(r.getRoleName().toUpperCase()));
    }

    private String primaryRole(User u) {
        return u.getRoles().stream().findFirst().map(r -> r.getRoleName().toUpperCase()).orElse("");
    }

    private String fullName(User u) {
        return ((u.getFirstName() == null ? "" : u.getFirstName()) + " " + (u.getLastName() == null ? "" : u.getLastName())).trim();
    }
}
