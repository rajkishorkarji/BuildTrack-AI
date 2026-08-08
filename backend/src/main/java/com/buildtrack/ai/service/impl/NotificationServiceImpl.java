package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.repository.NotificationRepository;
import com.buildtrack.ai.service.NotificationService;
import com.buildtrack.ai.service.RealtimePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RealtimePublisher realtimePublisher;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<Notification> getNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    public Notification createNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        realtimePublisher.publish("notifications", "created", saved.getId());
        return saved;
    }

    @Override
    public void markAllAsRead() {
        List<Notification> list = notificationRepository.findAll();
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
        realtimePublisher.publish("notifications", "marked_read", null);
    }

    @Override
    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(user.getEmail());
    }

    @Override
    public List<Notification> broadcast(User sender, String targetRole, String title, String message, Notification.NotificationType type) {
        String normalizedTarget = targetRole == null ? "" : targetRole.trim().toUpperCase(Locale.ROOT);
        List<User> recipients = userRepository.findAll().stream()
                .filter(user -> user.getCompanyId() != null)
                .filter(user -> sender.getCompanyId() == null || sender.getCompanyId().equals(user.getCompanyId()))
                .filter(user -> user.getRoles().stream().anyMatch(role -> normalizedTarget.equalsIgnoreCase(role.getRoleName())))
                .toList();
        List<Notification> saved = recipients.stream()
                .map(recipient -> notifyUser(recipient, recipient.getCompanyId(), sender.getFirstName() + " " + sender.getLastName(), title, message, type))
                .toList();
        realtimePublisher.publish("notifications", "broadcast", null);
        return saved;
    }

    @Override
    public Notification notifyUser(User recipient, Long companyId, String senderName, String title, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type == null ? Notification.NotificationType.INFO : type)
                .recipientEmail(recipient.getEmail())
                .companyId(companyId)
                .senderName(senderName)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    public void markAsReadForUser(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!user.getEmail().equalsIgnoreCase(notification.getRecipientEmail())) {
            throw new IllegalArgumentException("Notification does not belong to the current user");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        realtimePublisher.publish("notifications", "marked_read", notificationId);
    }
}
