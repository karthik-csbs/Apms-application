package com.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentProfileUpdateRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String mobile;
    private String skills;
    private String githubProfile;
    private String linkedinUrl;
    private String resumeUrl;
    private String registerNumber;
}
