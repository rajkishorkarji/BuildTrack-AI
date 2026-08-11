package com.buildtrack.ai.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {
    @Bean
    NewTopic domainEventsTopic(@Value("${app.kafka.topic.domain-events}") String topic) {
        return new NewTopic(topic, 3, (short) 1);
    }
}
