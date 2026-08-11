package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);
    List<Notification> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    long countByRecipientEmailAndReadFalse(String recipientEmail);
}
