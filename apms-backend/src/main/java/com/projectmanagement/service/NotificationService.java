package com.projectmanagement.service;

import com.projectmanagement.entity.Notification;
import com.projectmanagement.entity.Project;
import com.projectmanagement.entity.Student;
import com.projectmanagement.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void sendNotification(Student student, Project project, String title, String message) {
        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setProject(project);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long studentId) {
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public void markAsRead(Long notificationId, Long studentId) {
        Notification notification = notificationRepository.findByIdAndStudentId(notificationId, studentId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }
}
