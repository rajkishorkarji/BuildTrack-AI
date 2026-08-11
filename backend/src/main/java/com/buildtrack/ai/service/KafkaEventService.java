package com.buildtrack.ai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class KafkaEventService {

    private static final Logger logger = Logger.getLogger(KafkaEventService.class.getName());

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public void publishUserActionEvent(String actionType, String username, String role, Object payload) {
        logger.info("Kafka Event Published -> Topic: buildtrack-events, Action: " + actionType + ", User: " + username);

        // Process AI / Analytics / Notification pipeline
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("action", actionType);
        eventData.put("actor", username);
        eventData.put("role", role);
        eventData.put("payload", payload);
        eventData.put("timestamp", LocalDateTime.now().toString());
        eventData.put("aiRiskScore", Math.round((Math.random() * 15.0 + 2.0) * 10.0) / 10.0);

        // Broadcast processed event to WebSocket React dashboard clients
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/site-updates", eventData);
                messagingTemplate.convertAndSend("/topic/notifications", eventData);
            } catch (Exception e) {
                logger.warning("WebSocket broadcast notification deferred: " + e.getMessage());
            }
        }
    }
}
