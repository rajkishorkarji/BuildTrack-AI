package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotifications();
    Notification createNotification(Notification notification);
    void markAllAsRead();
}
