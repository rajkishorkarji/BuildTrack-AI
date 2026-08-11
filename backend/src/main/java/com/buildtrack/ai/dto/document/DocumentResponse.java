package com.buildtrack.ai.dto.document;
import java.time.LocalDateTime;
public record DocumentResponse(Long id, Long projectId, String projectName, String title, String fileType, String fileUrl, String uploadedBy, Long sizeBytes, LocalDateTime createdAt) {}
