package com.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long projectId;
    private String projectTitle;
    private String title;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
}
