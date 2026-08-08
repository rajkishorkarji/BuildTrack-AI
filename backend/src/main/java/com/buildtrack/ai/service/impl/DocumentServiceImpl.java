package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Document;
import com.buildtrack.ai.repository.DocumentRepository;
import com.buildtrack.ai.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Override
    public List<Document> getDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public List<Document> getDocumentsByCompany(Long companyId) {
        return documentRepository.findByProjectCompanyId(companyId);
    }
}
