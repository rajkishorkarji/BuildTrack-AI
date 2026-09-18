package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.repository.NotificationRepository;
import com.buildtrack.ai.service.NotificationService;
import com.buildtrack.ai.service.RealtimePublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final RealtimePublisher realtimePublisher;
    private final UserRepository userRepository;

    @Override
    public List<Notification> getNotifications() {
        return notificationRepository.findAll();
    }

    @Override
    @Transactional
    public Notification createNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        if (saved.getRecipientEmail() != null) {
            realtimePublisher.publishToUser(saved.getRecipientEmail(), "notifications", "created", saved);
        }
        return saved;
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        List<Notification> list = notificationRepository.findAll();
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        notificationRepository.flush();
    }

    @Override
    @Transactional
    public void markAllAsReadForUser(User user) {
        if (user == null || user.getEmail() == null) return;
        List<Notification> list = notificationRepository.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail());
        if (list.isEmpty()) return;
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
        notificationRepository.flush();
        realtimePublisher.publishToUser(user.getEmail(), "notifications", "read_all", null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsForUser(User user) {
        if (user == null || user.getEmail() == null) return List.of();
        return notificationRepository.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail());
    }

    @Override
    @Transactional
    public List<Notification> broadcast(User sender, String targetRole, String title, String message, Notification.NotificationType type) {
        String normalizedTarget = targetRole == null ? "" : targetRole.trim().toUpperCase(Locale.ROOT);
        List<User> recipients = sender.getCompanyId() == null
                ? userRepository.findAll().stream()
                    .filter(User::isEnabled)
                    .filter(u -> u.getRoles().stream().anyMatch(r -> normalizedTarget.equalsIgnoreCase(r.getRoleName())))
                    .toList()
                : userRepository.findEnabledByCompanyAndRole(sender.getCompanyId(), normalizedTarget);

        List<Notification> saved = recipients.stream()
                .map(recipient -> notifyUser(recipient, recipient.getCompanyId(), sender.getFirstName() + " " + sender.getLastName(), title, message, type))
                .toList();
        return saved;
    }

    @Override
    @Transactional
    public Notification notifyUser(User recipient, Long companyId, String senderName, String title, String message, Notification.NotificationType type) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type == null ? Notification.NotificationType.INFO : type)
                .recipientEmail(recipient.getEmail())
                .recipientUserId(recipient.getId())
                .companyId(companyId)
                .senderName(senderName)
                .read(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        realtimePublisher.publishToUser(recipient.getEmail(), "notifications", "created", saved);
        return saved;
    }

    @Override
    @Transactional
    public void markAsReadForUser(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (user.getCompanyId() != null && !user.getEmail().equalsIgnoreCase(notification.getRecipientEmail())) {
            throw new IllegalArgumentException("Notification does not belong to the current user");
        }
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        realtimePublisher.publishToUser(user.getEmail(), "notifications", "read", saved);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id, User user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        boolean isSuperAdmin = user.getRoles() != null && user.getRoles().stream().anyMatch(r -> "SUPER_ADMIN".equalsIgnoreCase(r.getRoleName()));
        if (!isSuperAdmin && (notification.getRecipientEmail() == null || !notification.getRecipientEmail().equalsIgnoreCase(user.getEmail()))) {
            throw new IllegalArgumentException("Notification does not belong to the current user");
        }
        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteNotifications(List<Long> ids, User user) {
        if (ids == null || ids.isEmpty() || user == null) return;
        boolean isSuperAdmin = user.getRoles() != null && user.getRoles().stream().anyMatch(r -> "SUPER_ADMIN".equalsIgnoreCase(r.getRoleName()));
        List<Notification> list = notificationRepository.findAllById(ids);
        List<Notification> toDelete = list.stream()
                .filter(n -> isSuperAdmin || (n.getRecipientEmail() != null && n.getRecipientEmail().equalsIgnoreCase(user.getEmail())))
                .toList();
        notificationRepository.deleteAll(toDelete);
        notificationRepository.flush();
    }

    @Override
    @Transactional
    public void deleteAllNotificationsForUser(User user) {
        if (user == null || user.getEmail() == null) return;
        boolean isSuperAdmin = user.getRoles() != null && user.getRoles().stream().anyMatch(r -> "SUPER_ADMIN".equalsIgnoreCase(r.getRoleName()));
        if (isSuperAdmin) {
            notificationRepository.deleteAll();
        } else {
            List<Notification> list = notificationRepository.findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(user.getEmail());
            notificationRepository.deleteAll(list);
        }
        notificationRepository.flush();
    }
}
