package com.buildtrack.ai.dto.notification;

import jakarta.validation.constraints.NotBlank;
import com.buildtrack.ai.entity.Notification.NotificationType;

public record BroadcastRequest(
        @NotBlank String title,
        @NotBlank String message,
        NotificationType type,
        String targetRole
) {}
