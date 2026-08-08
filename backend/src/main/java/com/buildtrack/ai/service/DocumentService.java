package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Document;
import java.util.List;

public interface DocumentService {
    List<Document> getDocuments();
    List<Document> getDocumentsByCompany(Long companyId);
}
