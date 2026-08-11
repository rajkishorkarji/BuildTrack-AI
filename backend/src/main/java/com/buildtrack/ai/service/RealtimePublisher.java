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
        publishTo("system", domain, action, payload);
    }

    public void publishForCompany(Long companyId, String domain, String action, Object payload) {
        if (companyId == null) return;
        publishTo("company/" + companyId, domain, action, payload);
    }

    /** Direct user channel. Used for private notifications so another tenant/user cannot see the payload. */
    public void publishToUser(String email, String domain, String action, Object payload) {
        if (messagingTemplate == null || email == null || email.isBlank()) return;
        Map<String, Object> message = envelope(domain, action, payload);
        messagingTemplate.convertAndSendToUser(email, "/queue/notifications", message);
    }

    private void publishTo(String scope, String domain, String action, Object payload) {
        if (messagingTemplate == null) return;
        messagingTemplate.convertAndSend("/topic/" + scope + "/" + domain, envelope(domain, action, payload));
        messagingTemplate.convertAndSend("/topic/" + scope + "/updates", envelope(domain, action, payload));
    }

    private Map<String, Object> envelope(String domain, String action, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("domain", domain);
        message.put("action", action);
        message.put("payload", payload);
        return message;
    }
}
