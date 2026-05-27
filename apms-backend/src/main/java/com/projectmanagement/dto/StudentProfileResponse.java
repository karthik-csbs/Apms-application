package com.projectmanagement.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudentProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String registerNumber;
    private String departmentName;
    private Long departmentId;
    private String mobile;
    private String skills;
    private String githubProfile;
    private String linkedinUrl;
    private String resumeUrl;
    private LocalDateTime createdAt;
}
