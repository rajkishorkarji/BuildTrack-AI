package com.buildtrack.ai.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RealtimePublisher {

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public void publish(String domain, String action, Object payload) {
        if (messagingTemplate != null) {
            Map<String, Object> message = new HashMap<>();
            message.put("domain", domain);
            message.put("action", action);
            message.put("payload", payload);
            messagingTemplate.convertAndSend("/topic/" + domain, message);
            messagingTemplate.convertAndSend("/topic/updates", message);
        }
    }
}
