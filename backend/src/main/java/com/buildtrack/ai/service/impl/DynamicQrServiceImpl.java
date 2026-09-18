package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.dto.attendance.DynamicQrResponse;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.exception.ResourceNotFoundException;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.service.DynamicQrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicQrServiceImpl implements DynamicQrService {

    private final ProjectRepository projectRepository;

    @Value("${app.jwt-secret:default-buildtrack-dynamic-qr-secret-key-32bytes!}")
    private String secretKey;

    private static final int ROTATION_INTERVAL_SECONDS = 30;
    private static final String PREFIX = "BT-DYN";

    @Override
    public DynamicQrResponse generateProjectDynamicToken(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        long currentEpochSecond = Instant.now().getEpochSecond();
        long windowIndex = currentEpochSecond / ROTATION_INTERVAL_SECONDS;
        long secondsRemaining = ROTATION_INTERVAL_SECONDS - (currentEpochSecond % ROTATION_INTERVAL_SECONDS);

        String signature = generateHmacSignature(projectId, windowIndex);
        String token = String.format("%s:%d:%d:%s", PREFIX, projectId, windowIndex, signature);

        return DynamicQrResponse.builder()
                .token(token)
                .projectId(projectId)
                .projectName(project.getName())
                .expiresInSeconds((int) secondsRemaining)
                .refreshIntervalSeconds(ROTATION_INTERVAL_SECONDS)
                .timestamp(currentEpochSecond)
                .build();
    }

    @Override
    public boolean validateDynamicToken(String token, Long projectId) {
        if (token == null || !token.startsWith(PREFIX + ":")) {
            return false;
        }

        try {
            String[] parts = token.split(":");
            if (parts.length != 4) {
                return false;
            }

            Long tokenProjectId = Long.parseLong(parts[1]);
            long tokenWindowIndex = Long.parseLong(parts[2]);
            String tokenSignature = parts[3];

            if (projectId != null && !projectId.equals(tokenProjectId)) {
                log.warn("Dynamic token project mismatch: expected {}, got {}", projectId, tokenProjectId);
                return false;
            }

            long currentEpochSecond = Instant.now().getEpochSecond();
            long currentWindowIndex = currentEpochSecond / ROTATION_INTERVAL_SECONDS;

            for (long w = currentWindowIndex - 1; w <= currentWindowIndex + 1; w++) {
                if (w == tokenWindowIndex) {
                    String expectedSignature = generateHmacSignature(tokenProjectId, w);
                    if (MessageDigest.isEqual(
                            tokenSignature.getBytes(StandardCharsets.UTF_8),
                            expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                        return true;
                    }
                }
            }

            log.warn("Dynamic token expired or invalid signature for project {}", tokenProjectId);
            return false;
        } catch (Exception e) {
            log.error("Failed to parse/validate dynamic token: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean isDynamicToken(String token) {
        return token != null && token.startsWith(PREFIX + ":");
    }

    private String generateHmacSignature(Long projectId, long windowIndex) {
        try {
            String payload = projectId + ":" + windowIndex;
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);
            byte[] hash = sha256Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hex = new StringBuilder();
            for (int i = 0; i < Math.min(hash.length, 6); i++) {
                hex.append(String.format("%02x", hash[i]));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate HMAC signature for dynamic QR", e);
        }
    }
}