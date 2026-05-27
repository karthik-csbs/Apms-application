package com.projectmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmissionRequest {
    private String documentUrl;
    private String githubUrl;
    private String driveUrl;
}
