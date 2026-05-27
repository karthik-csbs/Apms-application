package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.NotificationDto;
import com.projectmanagement.dto.NotificationResponse;
import com.projectmanagement.entity.Notification;
import com.projectmanagement.entity.Student;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class NotificationController {

    private final NotificationService notificationService;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getStudentNotifications(
            @AuthenticationPrincipal User user,
            org.springframework.security.core.Authentication authentication) {
        try {
            Student student = studentRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new com.projectmanagement.exception.ResourceNotFoundException("Student not found with email: " + user.getEmail()));
            
            Long studentId = student.getId();
            
            // Debug requirements
            System.out.println(studentId);
            System.out.println(authentication.getName());

            List<Notification> notifications = notificationService.getUserNotifications(studentId);
            List<NotificationDto> response = notifications.stream()
                    .map(n -> new NotificationDto(
                            n.getId(),
                            n.getTitle(),
                            n.getMessage(),
                            n.isReadStatus(),
                            n.getProject() != null ? n.getProject().getId() : null,
                            n.getProject() != null ? n.getProject().getTitle() : null,
                            n.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "Notifications fetched successfully", response));
        } catch (Exception e) {
            System.err.println("Error retrieving student notifications: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse<>(true, "Notifications fetched successfully (fallback)", java.util.Collections.emptyList()));
        }
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notification marked as read", null));
    }
}
