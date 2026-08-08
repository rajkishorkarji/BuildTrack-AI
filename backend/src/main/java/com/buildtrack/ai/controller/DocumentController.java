package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Document;
import com.buildtrack.ai.service.DocumentService;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.auth.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;
    @Autowired private TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Document>>> getDocuments() {
        User user = tenantAccessService.currentUser();
        List<Document> documents = tenantAccessService.isSuperAdmin(user) ? documentService.getDocuments()
                : documentService.getDocumentsByCompany(tenantAccessService.currentCompany().getId());
        return ResponseEntity.ok(ApiResponse.success(documents));
    }
}
