package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.RazorpayWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RazorpayWebhookEventRepository extends JpaRepository<RazorpayWebhookEvent, Long> {
    boolean existsByEventId(String eventId);
}
