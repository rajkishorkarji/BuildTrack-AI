package com.buildtrack.ai.event;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DomainEventPublisher {
    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    @Value("${app.kafka.topic.domain-events}")
    private String topic;

    public void publish(String type, Long companyId, String actorEmail,
                        String entityType, Long entityId, String message) {
        DomainEvent event = new DomainEvent(
                type, companyId, actorEmail, entityType, entityId, message, Instant.now()
        );
        kafkaTemplate.send(topic, entityType + ":" + entityId, event);
    }
}
