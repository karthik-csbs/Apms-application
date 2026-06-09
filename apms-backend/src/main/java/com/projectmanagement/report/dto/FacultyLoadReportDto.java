package com.projectmanagement.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyLoadReportDto {
    private Long facultyId;
    private String facultyName;
    private String department;
    private Long assignedProjects;
    private Long completedProjects;
    private Long pendingReviews;
    private Long activeReviews;
}
