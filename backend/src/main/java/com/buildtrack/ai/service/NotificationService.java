package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.auth.entity.User;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotifications();
    Notification createNotification(Notification notification);
    void markAllAsRead();
    void markAllAsReadForUser(User user);
    List<Notification> getNotificationsForUser(User user);
    List<Notification> broadcast(User sender, String targetRole, String title, String message, Notification.NotificationType type);
    Notification notifyUser(User recipient, Long companyId, String senderName, String title, String message, Notification.NotificationType type);
    void markAsReadForUser(Long notificationId, User user);
    void deleteNotification(Long id, User user);
    void deleteNotifications(List<Long> ids, User user);
    void deleteAllNotificationsForUser(User user);
}
