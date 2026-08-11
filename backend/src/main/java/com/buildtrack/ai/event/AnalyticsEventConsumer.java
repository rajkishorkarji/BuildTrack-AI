package com.buildtrack.ai.event;

import com.buildtrack.ai.analytics.EventAnalytics;
import com.buildtrack.ai.analytics.EventAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalyticsEventConsumer {
    private final EventAnalyticsRepository repository;

    @KafkaListener(topics = "${app.kafka.topic.domain-events}", groupId = "buildtrack-analytics")
    @Transactional
    public void handle(DomainEvent event) {
        repository.save(EventAnalytics.from(event));
        log.debug("Analytics event stored: {}", event.eventType());
    }
}
