package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.document.DocumentResponse;
import com.buildtrack.ai.entity.Document;
import com.buildtrack.ai.service.DocumentService;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocuments() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        documentService.listForUser(
                                tenantAccessService.currentUser()
                        )
                )
        );
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'COMPANY_ADMIN'," +
            "'PROJECT_MANAGER'," +
            "'SITE_ENGINEER'," +
            "'CONTRACTOR'" +
            ")"
    )
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam Long projectId
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        documentService.upload(
                                file,
                                projectId,
                                tenantAccessService.currentUser()
                        )
                )
        );
    }

    @GetMapping("/{stored}/download")
    public ResponseEntity<InputStreamResource> download(
            @PathVariable String stored
    ) throws Exception {

        User user =
                tenantAccessService.currentUser();

        Document document =
                documentService.getDocumentByStoredName(
                        stored,
                        user
                );

        Path path =
                documentService.filePath(stored);

        InputStream input =
                Files.newInputStream(path);

        MediaType type;

        try {

            type = MediaType.parseMediaType(
                    document.getFileType()
            );

        } catch (Exception exception) {

            type =
                    MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(type)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                document.getTitle()
                                        .replace("\"", "") +
                                "\""
                )
                .contentLength(
                        Files.size(path)
                )
                .body(
                        new InputStreamResource(input)
                );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole(" +
            "'SUPER_ADMIN'," +
            "'COMPANY_ADMIN'," +
            "'PROJECT_MANAGER'," +
            "'SITE_ENGINEER'," +
            "'CONTRACTOR'" +
            ")"
    )
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id
    ) {

        documentService.delete(
                id,
                tenantAccessService.currentUser()
        );

        return ResponseEntity.ok(
                ApiResponse.success(null)
        );
    }
}