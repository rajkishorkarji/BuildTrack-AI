package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.repository.NotificationRepository;
import com.buildtrack.ai.service.NotificationService;
import com.buildtrack.ai.service.RealtimePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RealtimePublisher realtimePublisher;

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
}
