package com.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyStudentDto {
    private Long id;
    private String name;
    private String email;
    private String registerNumber;
    private String mobile;
    private Long departmentId;
    private String departmentName;
    private Long projectId;
    private String projectTitle;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime lastCredentialEmailSent;
    private String emailDeliveryStatus;
}
