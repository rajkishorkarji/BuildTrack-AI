package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.*;
import com.buildtrack.ai.event.DomainEventPublisher;
import com.buildtrack.ai.repository.*;
import com.buildtrack.ai.service.MaterialService;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialTransactionRepository transactionRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final TenantAccessService tenantAccessService;
    private final DomainEventPublisher eventPublisher;
    private final RealtimePublisher realtimePublisher;

    @Override
    @Transactional(readOnly = true)
    public List<Material> getVisibleMaterials(Long projectId) {
        User user = tenantAccessService.currentUser();

        if (projectId != null) {
            Project project = authorizedProject(projectId, user);
            return materialRepository.findByProjectIdOrderByNameAsc(project.getId());
        }

        if (tenantAccessService.isSuperAdmin(user)) return materialRepository.findAll();
        return materialRepository.findByProjectCompanyIdOrderByNameAsc(user.getCompanyId());
    }

    @Override
    @Transactional
    public Material create(Material material) {
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(actor, "SITE_ENGINEER")
                && !tenantAccessService.hasRole(actor, "CONTRACTOR")) {
            throw new IllegalArgumentException("Only Company Admin, Site Engineer, or Contractor can create materials");
        }

        Project project = authorizedProject(material.getProject().getId(), actor);
        material.setProject(project);
        Material saved = materialRepository.save(material);

        eventPublisher.publish("MATERIAL_CREATED", actor.getCompanyId(), actor.getEmail(),
                "MATERIAL", saved.getId(), "Material " + saved.getName() + " was added");
        realtimePublisher.publishForCompany(actor.getCompanyId(), "materials", "created", saved.getId());
        return saved;
    }

    @Override
    @Transactional
    public MaterialTransaction receive(Long materialId, MaterialTransaction transaction) {
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(actor, "SITE_ENGINEER")
                && !tenantAccessService.hasRole(actor, "CONTRACTOR")) {
            throw new IllegalArgumentException("You cannot receive material");
        }

        Material material = authorizedMaterial(materialId, actor);
        requirePositive(transaction.getQuantity());

        transaction.setMaterial(material);
        transaction.setType(MaterialTransaction.TransactionType.RECEIPT);
        transaction.setPerformedBy(actor);

        material.setQuantity(material.getQuantity().add(transaction.getQuantity()));
        material.setStatus(material.getQuantity().compareTo(material.getReorderLevel()) <= 0 ? "LOW_STOCK" : "AVAILABLE");

        MaterialTransaction saved = transactionRepository.save(transaction);
        materialRepository.save(material);

        publishMaterialEvent(actor, material, "MATERIAL_RECEIVED",
                "Received " + transaction.getQuantity() + " " + material.getUnit() + " of " + material.getName());
        return saved;
    }

    @Override
    @Transactional
    public MaterialTransaction issue(Long materialId, MaterialTransaction transaction) {
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(actor, "SITE_ENGINEER")
                && !tenantAccessService.hasRole(actor, "CONTRACTOR")
                && !tenantAccessService.hasRole(actor, "WORKER")) {
            throw new IllegalArgumentException("You cannot issue material");
        }

        Material material = authorizedMaterial(materialId, actor);
        requirePositive(transaction.getQuantity());

        if (material.getQuantity().compareTo(transaction.getQuantity()) < 0) {
            throw new IllegalArgumentException("Insufficient material stock");
        }

        transaction.setMaterial(material);
        transaction.setType(MaterialTransaction.TransactionType.ISSUE);
        transaction.setPerformedBy(actor);

        material.setQuantity(material.getQuantity().subtract(transaction.getQuantity()));
        material.setStatus(material.getQuantity().compareTo(material.getReorderLevel()) <= 0 ? "LOW_STOCK" : "AVAILABLE");

        MaterialTransaction saved = transactionRepository.save(transaction);
        materialRepository.save(material);

        publishMaterialEvent(actor, material, "MATERIAL_ISSUED",
                "Issued " + transaction.getQuantity() + " " + material.getUnit() + " of " + material.getName());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialTransaction> history(Long materialId) {
        User actor = tenantAccessService.currentUser();
        authorizedMaterial(materialId, actor);
        return transactionRepository.findByMaterialIdOrderByCreatedAtDesc(materialId);
    }

    private Material authorizedMaterial(Long id, User user) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material not found"));
        authorizedProject(material.getProject().getId(), user);
        return material;
    }

    private Project authorizedProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (tenantAccessService.isSuperAdmin(user)) return project;
        if (!user.getCompanyId().equals(project.getCompany().getId())) {
            throw new IllegalArgumentException("Project belongs to another company");
        }

        if (!tenantAccessService.hasRole(user, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(user, "SITE_ENGINEER")
                && !tenantAccessService.hasRole(user, "PROJECT_MANAGER")
                && !assignmentRepository.existsByProjectIdAndUserIdAndStatus(projectId, user.getId(), "ACTIVE")) {
            throw new IllegalArgumentException("You are not assigned to this project");
        }
        return project;
    }

    private void requirePositive(BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
    }

    private void publishMaterialEvent(User actor, Material material, String type, String message) {
        eventPublisher.publish(type, actor.getCompanyId(), actor.getEmail(),
                "MATERIAL", material.getId(), message);
        realtimePublisher.publishForCompany(actor.getCompanyId(), "materials", "updated", material.getId());
    }
}
