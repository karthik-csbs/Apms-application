package com.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyStudentResponseDto {
    private Long studentId;
    private String username;
    private String temporaryPassword;
    private boolean emailSent;
    private String studentEmail;
}
