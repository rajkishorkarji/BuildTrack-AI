package com.buildtrack.ai.analytics;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event_analytics")
public class EventAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventType;
    private Long companyId;
    private String entityType;
    private Long entityId;
    private String actorEmail;

    @Column(columnDefinition = "TEXT")
    private String payloadMessage;

    @Column(nullable = false)
    private LocalDateTime occurredAt;

    @Column(nullable = false)
    private LocalDateTime processedAt;

    public static EventAnalytics from(com.buildtrack.ai.event.DomainEvent event) {
        return EventAnalytics.builder()
                .eventType(event.eventType())
                .companyId(event.companyId())
                .entityType(event.entityType())
                .entityId(event.entityId())
                .actorEmail(event.actorEmail())
                .payloadMessage(event.message())
                .occurredAt(event.occurredAt() == null ? LocalDateTime.now() : LocalDateTime.ofInstant(event.occurredAt(), ZoneOffset.UTC))
                .processedAt(LocalDateTime.now())
                .build();
    }
}
