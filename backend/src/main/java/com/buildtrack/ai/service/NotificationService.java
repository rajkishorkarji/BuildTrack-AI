package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Notification;
import java.util.List;

public interface NotificationService {
    List<Notification> getNotifications();
    void markAllAsRead();
}
