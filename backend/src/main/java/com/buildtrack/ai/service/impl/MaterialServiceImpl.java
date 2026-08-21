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
    private final MaterialRequestRepository requestRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
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
        if (user.getCompanyId() != null) {
            return materialRepository.findByProjectCompanyIdOrderByNameAsc(user.getCompanyId());
        }
        return materialRepository.findAll();
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

        if (material.getProject() == null || material.getProject().getId() == null) {
            throw new IllegalArgumentException("Project is required to create a material");
        }

        if (material.getName() == null || material.getName().isBlank()) {
            throw new IllegalArgumentException("Material name is required");
        }

        Project project = authorizedProject(material.getProject().getId(), actor);
        material.setProject(project);

        List<Material> existingList = materialRepository.findByProjectIdOrderByNameAsc(project.getId());
        Material existing = existingList.stream()
                .filter(m -> m.getName() != null && m.getName().trim().equalsIgnoreCase(material.getName().trim()))
                .findFirst().orElse(null);

        if (existing != null) {
            BigDecimal addQty = material.getQuantity() != null ? material.getQuantity() : BigDecimal.ZERO;
            existing.setQuantity(existing.getQuantity().add(addQty));
            if (material.getUnit() != null && !material.getUnit().isBlank()) existing.setUnit(material.getUnit());
            if (material.getUnitCost() != null && material.getUnitCost().compareTo(BigDecimal.ZERO) > 0) existing.setUnitCost(material.getUnitCost());
            if (material.getReorderLevel() != null) existing.setReorderLevel(material.getReorderLevel());
            existing.setStatus(existing.getQuantity().compareTo(existing.getReorderLevel()) <= 0 ? "LOW_STOCK" : "AVAILABLE");
            Material saved = materialRepository.save(existing);
            publishMaterialEvent(actor, saved, "MATERIAL_UPDATED", "Updated stock for " + saved.getName());
            return saved;
        }

        if (material.getQuantity() == null) material.setQuantity(BigDecimal.ZERO);
        if (material.getReorderLevel() == null) material.setReorderLevel(BigDecimal.ZERO);
        if (material.getUnitCost() == null) material.setUnitCost(BigDecimal.ZERO);
        if (material.getUnit() == null || material.getUnit().isBlank()) material.setUnit("units");
        material.setName(material.getName().trim());
        material.setStatus(material.getQuantity().compareTo(material.getReorderLevel()) <= 0 ? "LOW_STOCK" : "AVAILABLE");

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

    // Material Requests Implementation
    @Override
    @Transactional
    public MaterialRequest createRequest(MaterialRequest request) {
        User actor = tenantAccessService.currentUser();
        if (request.getMaterial() == null || request.getMaterial().getId() == null) {
            throw new IllegalArgumentException("Material selection is required");
        }
        Material material = authorizedMaterial(request.getMaterial().getId(), actor);
        requirePositive(request.getQuantity());

        request.setMaterial(material);
        request.setProject(material.getProject());
        request.setRequestedBy(actor);
        request.setStatus("PENDING");

        if (request.getTask() != null && request.getTask().getId() != null) {
            TaskEntity task = taskRepository.findById(request.getTask().getId()).orElse(null);
            request.setTask(task);
        }

        MaterialRequest saved = requestRepository.save(request);
        publishMaterialEvent(actor, material, "MATERIAL_REQUEST_CREATED",
                "Material request created for " + saved.getQuantity() + " " + material.getUnit() + " of " + material.getName());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialRequest> getRequests(Long projectId) {
        User user = tenantAccessService.currentUser();
        if (projectId != null) {
            authorizedProject(projectId, user);
            return requestRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        }
        if (tenantAccessService.isSuperAdmin(user)) return requestRepository.findAll();
        if (user.getCompanyId() != null) {
            return requestRepository.findByProjectCompanyIdOrderByCreatedAtDesc(user.getCompanyId());
        }
        return requestRepository.findAll();
    }

    @Override
    @Transactional
    public MaterialRequest issueRequest(Long requestId) {
        User actor = tenantAccessService.currentUser();
        MaterialRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Material request not found"));
        authorizedProject(req.getProject().getId(), actor);

        Material material = req.getMaterial();
        if (material.getQuantity().compareTo(req.getQuantity()) < 0) {
            throw new IllegalArgumentException("Insufficient material stock to fulfill request");
        }

        material.setQuantity(material.getQuantity().subtract(req.getQuantity()));
        material.setStatus(material.getQuantity().compareTo(material.getReorderLevel()) <= 0 ? "LOW_STOCK" : "AVAILABLE");
        materialRepository.save(material);

        MaterialTransaction tx = MaterialTransaction.builder()
                .material(material)
                .type(MaterialTransaction.TransactionType.ISSUE)
                .quantity(req.getQuantity())
                .unitCost(material.getUnitCost() != null ? material.getUnitCost() : BigDecimal.ZERO)
                .performedBy(actor)
                .notes("Issued for Request #" + req.getId() + (req.getReason() != null ? ": " + req.getReason() : ""))
                .build();
        transactionRepository.save(tx);

        req.setStatus("ISSUED");
        req.setIssuedBy(actor);
        MaterialRequest saved = requestRepository.save(req);

        publishMaterialEvent(actor, material, "MATERIAL_REQUEST_ISSUED",
                "Issued " + req.getQuantity() + " " + material.getUnit() + " of " + material.getName() + " for request #" + req.getId());
        return saved;
    }

    @Override
    @Transactional
    public MaterialRequest workerReceiveRequest(Long requestId) {
        User actor = tenantAccessService.currentUser();
        MaterialRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Material request not found"));
        authorizedProject(req.getProject().getId(), actor);

        req.setStatus("WORKER_RECEIVED");
        MaterialRequest saved = requestRepository.save(req);

        publishMaterialEvent(actor, req.getMaterial(), "MATERIAL_REQUEST_WORKER_RECEIVED",
                "Worker received material for request #" + req.getId());
        return saved;
    }

    @Override
    @Transactional
    public MaterialRequest confirmRequest(Long requestId) {
        User actor = tenantAccessService.currentUser();
        MaterialRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Material request not found"));
        authorizedProject(req.getProject().getId(), actor);

        req.setStatus("CONFIRMED");
        MaterialRequest saved = requestRepository.save(req);

        publishMaterialEvent(actor, req.getMaterial(), "MATERIAL_REQUEST_CONFIRMED",
                "Engineer confirmed material receipt for request #" + req.getId());
        return saved;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User actor = tenantAccessService.currentUser();
        if (!tenantAccessService.hasRole(actor, "COMPANY_ADMIN")
                && !tenantAccessService.hasRole(actor, "SITE_ENGINEER")
                && !tenantAccessService.hasRole(actor, "CONTRACTOR")) {
            throw new IllegalArgumentException("You do not have permission to delete materials");
        }

        Material material = authorizedMaterial(id, actor);
        materialRepository.delete(material);

        if (actor.getCompanyId() != null) {
            eventPublisher.publish("MATERIAL_DELETED", actor.getCompanyId(), actor.getEmail(),
                    "MATERIAL", id, "Material " + material.getName() + " was deleted");
            realtimePublisher.publishForCompany(actor.getCompanyId(), "materials", "deleted", id);
        }
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
        if (user.getCompanyId() != null && project.getCompany() != null && !user.getCompanyId().equals(project.getCompany().getId())) {
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
        if (actor != null && actor.getCompanyId() != null) {
            eventPublisher.publish(type, actor.getCompanyId(), actor.getEmail(),
                    "MATERIAL", material.getId(), message);
            realtimePublisher.publishForCompany(actor.getCompanyId(), "materials", "updated", material.getId());
        }
    }
}
