package com.projectmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FacultyStudentCreateDto {
    @NotBlank(message = "Student Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Register Number is required")
    private String registerNumber;

    private String mobile;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    private Long projectId;
}
