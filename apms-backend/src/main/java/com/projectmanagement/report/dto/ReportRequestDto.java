package com.projectmanagement.report.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDto {
    private ReportType reportType;
    private ExportFormat exportFormat;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Long departmentId;
    private Long facultyId;
    private String projectType;
    private String status;
}
