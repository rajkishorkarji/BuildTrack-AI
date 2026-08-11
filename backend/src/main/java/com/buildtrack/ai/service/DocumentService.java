package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.document.DocumentResponse;
import com.buildtrack.ai.entity.Document;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

public interface DocumentService {

    List<Document> getDocuments();

    List<Document> getDocumentsByCompany(Long companyId);

    List<DocumentResponse> listForUser(User user);

    DocumentResponse upload(
            MultipartFile file,
            Long projectId,
            User user
    );

    Document getDocumentByStoredName(
            String storedName,
            User user
    );

    Path filePath(String storedName);

    void delete(
            Long id,
            User user
    );
}