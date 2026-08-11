package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.config.FileStorageConfig;
import com.buildtrack.ai.entity.Document;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.DocumentRepository;
import com.buildtrack.ai.repository.ProjectAssignmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.dto.document.DocumentResponse;
import com.buildtrack.ai.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final FileStorageConfig storageConfig;

    @Override @Transactional(readOnly = true)
    public List<Document> getDocuments() { return documentRepository.findAll(); }

    @Override @Transactional(readOnly = true)
    public List<Document> getDocumentsByCompany(Long companyId) { return documentRepository.findByProjectCompanyId(companyId); }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listForUser(User user) {
        List<Document> docs;
        if (isSuper(user)) docs = documentRepository.findAll();
        else if (user.getCompanyId() != null) docs = documentRepository.findByProjectCompanyId(user.getCompanyId());
        else docs = List.of();
        return docs.stream().filter(d -> d.getProject() == null || canAccess(d.getProject(), user)).map(this::toResponse).toList();
    }

    @Transactional
    public DocumentResponse upload(MultipartFile file, Long projectId, User user) {
        if (file == null || file.isEmpty()) throw new BadRequestException("A file is required");
        if (file.getSize() > 25L * 1024 * 1024) throw new BadRequestException("Maximum file size is 25 MB");
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        assertProjectAccess(project, user);
        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("document").replaceAll("[^a-zA-Z0-9._-]", "_");
        String stored = UUID.randomUUID() + "-" + original;
        Path dir = storageConfig.getUploadPath().resolve("documents").resolve(String.valueOf(projectId));
        try {
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(stored), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) { throw new BadRequestException("Unable to store document"); }
        String name = fullName(user);
        Document doc = Document.builder().project(project).title(original).fileType(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"))
            .fileUrl("/api/documents/" + stored + "/download").uploadedBy(name).fileSizeBytes(file.getSize()).build();
        return toResponse(documentRepository.save(doc));
    }

    @Transactional
    public void delete(Long id, User user) {
        Document doc = documentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        if (doc.getProject() == null) throw new BadRequestException("Document has no project");
        assertProjectAccess(doc.getProject(), user);
        String stored = doc.getFileUrl() == null ? null : doc.getFileUrl().replace("/api/documents/", "").replace("/download", "");
        if (stored != null) {
            try { Files.walk(storageConfig.getUploadPath().resolve("documents").resolve(String.valueOf(doc.getProject().getId())))
                .filter(p -> p.getFileName().toString().equals(stored)).findFirst().ifPresent(p -> { try { Files.deleteIfExists(p); } catch (IOException ignored) {} });
            } catch (IOException ignored) {}
        }
        documentRepository.delete(doc);
    }

    public Path filePath(String stored) {
        if (stored == null || stored.contains("..") || stored.contains("/") || stored.contains("\\")) throw new BadRequestException("Invalid file");
        List<Path> roots = List.of(storageConfig.getUploadPath().resolve("documents"));
        try {
            return Files.walk(roots.get(0)).filter(p -> p.getFileName().toString().equals(stored)).findFirst().orElseThrow(() -> new ResourceNotFoundException("File not found"));
        } catch (IOException e) { throw new ResourceNotFoundException("File not found"); }
    }

    public Document getDocumentByStoredName(String stored, User user) {
        Document doc = documentRepository.findAll().stream().filter(d -> d.getFileUrl() != null && d.getFileUrl().contains("/api/documents/" + stored + "/download")).findFirst().orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        if (doc.getProject() == null) throw new BadRequestException("Document has no project");
        assertProjectAccess(doc.getProject(), user);
        return doc;
    }

    private boolean canAccess(Project p, User u) { try { assertProjectAccess(p,u); return true; } catch (RuntimeException e) { return false; } }
    private void assertProjectAccess(Project p, User u) {
        if (isSuper(u)) return;
        if (u.getCompanyId() == null || !u.getCompanyId().equals(p.getCompany().getId())) throw new BadRequestException("Document belongs to another company");
        String r = role(u); if ("COMPANY_ADMIN".equals(r)) return;
        if (!assignmentRepository.existsByProjectIdAndUserIdAndStatus(p.getId(), u.getId(), "ACTIVE")) throw new BadRequestException("You are not assigned to this project");
    }
    private boolean isSuper(User u) { return "SUPER_ADMIN".equals(role(u)); }
    private String role(User u) { return u.getRoles().stream().findFirst().map(x -> x.getRoleName().toUpperCase(Locale.ROOT)).orElse(""); }
    private String fullName(User u) { return ((u.getFirstName()==null?"":u.getFirstName())+" "+(u.getLastName()==null?"":u.getLastName())).trim(); }
    private DocumentResponse toResponse(Document d) { return new DocumentResponse(d.getId(), d.getProject()==null?null:d.getProject().getId(), d.getProject()==null?null:d.getProject().getName(), d.getTitle(), d.getFileType(), d.getFileUrl(), d.getUploadedBy(), d.getFileSizeBytes(), d.getCreatedAt()); }
}
