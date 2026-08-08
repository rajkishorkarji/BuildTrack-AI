package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.auth.entity.User;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotifications();
    Notification createNotification(Notification notification);
    void markAllAsRead();
    List<Notification> getNotificationsForUser(User user);
    List<Notification> broadcast(User sender, String targetRole, String title, String message, Notification.NotificationType type);
    Notification notifyUser(User recipient, Long companyId, String senderName, String title, String message, Notification.NotificationType type);
    void markAsReadForUser(Long notificationId, User user);
}
