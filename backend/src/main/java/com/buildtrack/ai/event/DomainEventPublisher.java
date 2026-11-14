package com.buildtrack.ai.event;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class DomainEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(DomainEventPublisher.class);

    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    @Value("${app.kafka.topic.domain-events}")
    private String topic;

    private final ExecutorService executor = Executors.newCachedThreadPool();

    public void publish(String type, Long companyId, String actorEmail,
                        String entityType, Long entityId, String message) {
        executor.submit(() -> {
            try {
                DomainEvent event = new DomainEvent(
                        type, companyId, actorEmail, entityType, entityId, message, Instant.now()
                );
                kafkaTemplate.send(topic, entityType + ":" + entityId, event);
            } catch (Exception e) {
                log.debug("Event publishing skipped (Kafka offline): {}", e.getMessage());
            }
        });
    }
}
