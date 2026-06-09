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
public class ProjectReportDto {
    private Long projectId;
    private String projectTitle;
    private String projectType;
    private String projectStatus;
    private String workflowStatus;
    private String guideName;
    private String teamName;
    private LocalDateTime createdDate;
    private LocalDateTime completedDate;
}
