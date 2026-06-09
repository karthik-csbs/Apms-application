package com.projectmanagement.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionReportDto {
    private Long submissionId;
    private String projectName;
    private String submittedBy;
    private LocalDateTime submissionDate;
    private String gitHubUrl;
    private String documentationUrl;
    private String status;
}
