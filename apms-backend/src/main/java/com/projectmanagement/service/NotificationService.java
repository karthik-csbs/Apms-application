package com.projectmanagement.service;

import com.projectmanagement.entity.Notification;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void sendNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        // Assume custom query in repository: findByUserIdOrderByCreatedAtDesc
        return notificationRepository.findAll(); // Placeholder, requires custom repo method
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
