package com.projectmanagement.report.service;

import com.projectmanagement.entity.User;
import com.projectmanagement.report.dto.*;
import java.util.List;

public interface ReportService {
    List<ProjectReportDto> generateProjectReport(ReportRequestDto request, User loggedInUser);
    List<ReviewReportDto> generateReviewReport(ReportRequestDto request, User loggedInUser);
    List<FacultyLoadReportDto> generateFacultyLoadReport(ReportRequestDto request, User loggedInUser);
    List<SubmissionReportDto> generateSubmissionReport(ReportRequestDto request, User loggedInUser);
    
    byte[] exportPdf(ReportType type, List<?> data);
    byte[] exportExcel(ReportType type, List<?> data);
    byte[] exportCsv(ReportType type, List<?> data);
    java.util.Map<String, Object> getDashboardSummary(User loggedInUser);
}
