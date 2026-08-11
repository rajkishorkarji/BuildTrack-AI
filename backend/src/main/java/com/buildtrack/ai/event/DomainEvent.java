package com.buildtrack.ai.event;

import java.time.Instant;

public record DomainEvent(
        String eventType,
        Long companyId,
        String actorEmail,
        String entityType,
        Long entityId,
        String message,
        Instant occurredAt
) {}
