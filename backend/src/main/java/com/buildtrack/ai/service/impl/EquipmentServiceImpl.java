package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.entity.*;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.repository.EquipmentMaintenanceRepository;
import com.buildtrack.ai.repository.EquipmentRepository;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.service.EquipmentService;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentServiceImpl implements EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final com.buildtrack.ai.repository.ProjectRepository projectRepository;
    private final EquipmentMaintenanceRepository maintenanceRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final TenantAccessService tenantAccessService;
    private final RealtimePublisher realtimePublisher;
    private final DomainEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<Equipment> getVisibleEquipment() {
        User user = tenantAccessService.currentUser();
        if (tenantAccessService.isSuperAdmin(user)) return equipmentRepository.findAll();

        if (tenantAccessService.hasRole(user, "COMPANY_ADMIN")) {
            return equipmentRepository.findByProjectCompanyId(user.getCompanyId());
        }

        List<Long> projectIds = assignmentRepository.findProjectsForUser(user.getId(), "ACTIVE")
                .stream().map(Project::getId).toList();

        if (projectIds.isEmpty()) return List.of();
        return equipmentRepository.findByProjectIds(projectIds);
    }

    @Override
    @Transactional
    public Equipment createEquipment(Equipment equipment) {
        User actor = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(actor);
        tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());

        if (equipment.getProject() == null || equipment.getProject().getId() == null) {
            throw new IllegalArgumentException("Equipment must be assigned to a project");
        }

        Project project = validateProject(equipment.getProject().getId());
        equipment.setProject(project);

        Equipment saved = equipmentRepository.save(equipment);
        eventPublisher.publish("EQUIPMENT_CREATED", actor.getCompanyId(), actor.getEmail(),
                "EQUIPMENT", saved.getId(), "New equipment " + saved.getName() + " was registered");
        realtimePublisher.publishForCompany(actor.getCompanyId(), "equipment", "created", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Equipment updateStatus(Long id, String status) {
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.isSuperAdmin(actor)
                && !tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(actor, "PROJECT_MANAGER")
                && !tenantAccessService.hasRole(actor, "SITE_ENGINEER")
                && !tenantAccessService.hasRole(actor, "CONTRACTOR")) {
            throw new IllegalArgumentException("You cannot change equipment status");
        }
        Equipment equipment = getAuthorizedEquipment(id, actor);

        Equipment.EquipmentStatus next;
        try {
            next = Equipment.EquipmentStatus.valueOf(status.toUpperCase().replace(' ', '_'));
        } catch (Exception e) {
            throw new IllegalArgumentException("Unsupported equipment status: " + status);
        }

        equipment.setStatus(next);
        Equipment saved = equipmentRepository.save(equipment);
        eventPublisher.publish("EQUIPMENT_STATUS_UPDATED", actor.getCompanyId(), actor.getEmail(),
                "EQUIPMENT", saved.getId(), "Equipment " + saved.getName() + " status changed to " + next);
        realtimePublisher.publishForCompany(actor.getCompanyId(), "equipment", "updated", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public Equipment assign(Long equipmentId, Long userId) {
        User actor = tenantAccessService.currentUser();
        tenantAccessService.requireCompanyAdmin(actor);

        Equipment equipment = getAuthorizedEquipment(equipmentId, actor);
        User assignee = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));

        if (!actor.getCompanyId().equals(assignee.getCompanyId())) {
            throw new IllegalArgumentException("Assignee belongs to another company");
        }

        boolean eligibleRole = tenantAccessService.hasRole(assignee, "PROJECT_MANAGER")
                || tenantAccessService.hasRole(assignee, "SITE_ENGINEER")
                || tenantAccessService.hasRole(assignee, "CONTRACTOR")
                || tenantAccessService.hasRole(assignee, "WORKER");
        if (!eligibleRole) {
            throw new IllegalArgumentException("Equipment can only be assigned to project personnel");
        }

        if (equipment.getProject() != null &&
                !assignmentRepository.existsByProjectIdAndUserIdAndStatus(
                        equipment.getProject().getId(), assignee.getId(), "ACTIVE")) {
            ProjectAssignment newAssignment = new ProjectAssignment();
            newAssignment.setProject(equipment.getProject());
            newAssignment.setUser(assignee);
            newAssignment.setAssignmentRole(assignee.getRoles().isEmpty() ? "WORKER" : assignee.getRoles().iterator().next().getRoleName());
            newAssignment.setStatus("ACTIVE");
            assignmentRepository.save(newAssignment);
        }

        equipment.setAssignedUser(assignee);
        Equipment saved = equipmentRepository.save(equipment);
        eventPublisher.publish("EQUIPMENT_ASSIGNED", actor.getCompanyId(), actor.getEmail(),
                "EQUIPMENT", saved.getId(), "Equipment " + saved.getName() + " was assigned");
        realtimePublisher.publishForCompany(actor.getCompanyId(), "equipment", "assigned", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public EquipmentMaintenance scheduleMaintenance(Long equipmentId, EquipmentMaintenance maintenance) {
        User actor = tenantAccessService.currentUser();
        Equipment equipment = getAuthorizedEquipment(equipmentId, actor);

        if (!tenantAccessService.isSuperAdmin(actor)
                && !tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(actor, "SITE_ENGINEER")) {
            throw new IllegalArgumentException("Only Company Admin or Site Engineer can manage maintenance");
        }

        maintenance.setEquipment(equipment);
        EquipmentMaintenance saved = maintenanceRepository.save(maintenance);
        equipment.setNextServiceDue(saved.getNextDueDate());
        equipment.setLastServicedDate(saved.getServiceDate());
        equipment.setStatus(Equipment.EquipmentStatus.IN_MAINTENANCE);
        equipmentRepository.save(equipment);

        eventPublisher.publish("EQUIPMENT_MAINTENANCE_SCHEDULED", actor.getCompanyId(), actor.getEmail(),
                "EQUIPMENT", equipment.getId(), "Maintenance scheduled for " + equipment.getName());
        realtimePublisher.publishForCompany(actor.getCompanyId(), "equipment", "maintenance", equipment.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentMaintenance> maintenanceHistory(Long equipmentId) {
        User actor = tenantAccessService.currentUser();
        getAuthorizedEquipment(equipmentId, actor);
        return maintenanceRepository.findByEquipmentIdOrderByServiceDateDesc(equipmentId);
    }

    private Equipment getAuthorizedEquipment(Long id, User actor) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found"));

        if (tenantAccessService.isSuperAdmin(actor)) return equipment;

        if (equipment.getProject() == null ||
                !actor.getCompanyId().equals(equipment.getProject().getCompany().getId())) {
            throw new IllegalArgumentException("Equipment does not belong to your company");
        }

        if (!tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !assignmentRepository.existsByProjectIdAndUserIdAndStatus(
                    equipment.getProject().getId(), actor.getId(), "ACTIVE")) {
            throw new IllegalArgumentException("You are not assigned to this equipment project");
        }
        return equipment;
    }

    private Project validateProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.isSuperAdmin(actor)
                && !actor.getCompanyId().equals(project.getCompany().getId())) {
            throw new IllegalArgumentException("Project belongs to another company");
        }
        return project;
    }
}
