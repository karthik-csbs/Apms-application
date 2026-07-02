package com.projectmanagement.report.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.entity.User;
import com.projectmanagement.report.dto.*;
import com.projectmanagement.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reporting & Export", description = "Endpoints for generating reports and exports")
@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")
@lombok.extern.slf4j.Slf4j
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/project")
    @Operation(summary = "Get project report data")
    public ResponseEntity<ApiResponse<List<ProjectReportDto>>> getProjectReport(
            ReportRequestDto request,
            @AuthenticationPrincipal User user) {
        List<ProjectReportDto> data = reportService.generateProjectReport(request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project report data fetched successfully", data));
    }

    @GetMapping("/review")
    @Operation(summary = "Get review report data")
    public ResponseEntity<ApiResponse<List<ReviewReportDto>>> getReviewReport(
            ReportRequestDto request,
            @AuthenticationPrincipal User user) {
        List<ReviewReportDto> data = reportService.generateReviewReport(request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Review report data fetched successfully", data));
    }

    @GetMapping("/faculty-load")
    @Operation(summary = "Get faculty load report data")
    public ResponseEntity<ApiResponse<List<FacultyLoadReportDto>>> getFacultyLoadReport(
            ReportRequestDto request,
            @AuthenticationPrincipal User user) {
        List<FacultyLoadReportDto> data = reportService.generateFacultyLoadReport(request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty load report data fetched successfully", data));
    }

    @GetMapping("/submission")
    @Operation(summary = "Get submission report data")
    public ResponseEntity<ApiResponse<List<SubmissionReportDto>>> getSubmissionReport(
            ReportRequestDto request,
            @AuthenticationPrincipal User user) {
        List<SubmissionReportDto> data = reportService.generateSubmissionReport(request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Submission report data fetched successfully", data));
    }

    @GetMapping("/project/export/pdf")
    public ResponseEntity<Resource> exportProjectPdf(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - PROJECT PDF");
        List<ProjectReportDto> data = reportService.generateProjectReport(request, user);
        log.info("Project report data size: {}", data.size());
        byte[] bytes = reportService.exportPdf(ReportType.PROJECT, data);
        return createFileResponse(bytes, "project-report-" + LocalDate.now() + ".pdf", "application/pdf");
    }

    @GetMapping("/project/export/excel")
    public ResponseEntity<Resource> exportProjectExcel(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - PROJECT EXCEL");
        List<ProjectReportDto> data = reportService.generateProjectReport(request, user);
        log.info("Project report data size: {}", data.size());
        byte[] bytes = reportService.exportExcel(ReportType.PROJECT, data);
        return createFileResponse(bytes, "project-report-" + LocalDate.now() + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @GetMapping("/project/export/csv")
    public ResponseEntity<Resource> exportProjectCsv(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - PROJECT CSV");
        List<ProjectReportDto> data = reportService.generateProjectReport(request, user);
        log.info("Project report data size: {}", data.size());
        byte[] bytes = reportService.exportCsv(ReportType.PROJECT, data);
        return createFileResponse(bytes, "project-report-" + LocalDate.now() + ".csv", "text/csv");
    }

    @GetMapping("/review/export/pdf")
    public ResponseEntity<Resource> exportReviewPdf(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - REVIEW PDF");
        List<ReviewReportDto> data = reportService.generateReviewReport(request, user);
        log.info("Review report data size: {}", data.size());
        byte[] bytes = reportService.exportPdf(ReportType.REVIEW, data);
        return createFileResponse(bytes, "review-report-" + LocalDate.now() + ".pdf", "application/pdf");
    }

    @GetMapping("/review/export/excel")
    public ResponseEntity<Resource> exportReviewExcel(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - REVIEW EXCEL");
        List<ReviewReportDto> data = reportService.generateReviewReport(request, user);
        log.info("Review report data size: {}", data.size());
        byte[] bytes = reportService.exportExcel(ReportType.REVIEW, data);
        return createFileResponse(bytes, "review-report-" + LocalDate.now() + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @GetMapping("/review/export/csv")
    public ResponseEntity<Resource> exportReviewCsv(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - REVIEW CSV");
        List<ReviewReportDto> data = reportService.generateReviewReport(request, user);
        log.info("Review report data size: {}", data.size());
        byte[] bytes = reportService.exportCsv(ReportType.REVIEW, data);
        return createFileResponse(bytes, "review-report-" + LocalDate.now() + ".csv", "text/csv");
    }

    @GetMapping("/faculty-load/export/pdf")
    public ResponseEntity<Resource> exportFacultyLoadPdf(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - FACULTY LOAD PDF");
        List<FacultyLoadReportDto> data = reportService.generateFacultyLoadReport(request, user);
        log.info("Faculty load report data size: {}", data.size());
        byte[] bytes = reportService.exportPdf(ReportType.FACULTY_LOAD, data);
        return createFileResponse(bytes, "faculty-load-report-" + LocalDate.now() + ".pdf", "application/pdf");
    }

    @GetMapping("/faculty-load/export/excel")
    public ResponseEntity<Resource> exportFacultyLoadExcel(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - FACULTY LOAD EXCEL");
        List<FacultyLoadReportDto> data = reportService.generateFacultyLoadReport(request, user);
        log.info("Faculty load report data size: {}", data.size());
        byte[] bytes = reportService.exportExcel(ReportType.FACULTY_LOAD, data);
        return createFileResponse(bytes, "faculty-load-report-" + LocalDate.now() + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @GetMapping("/faculty-load/export/csv")
    public ResponseEntity<Resource> exportFacultyLoadCsv(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - FACULTY LOAD CSV");
        List<FacultyLoadReportDto> data = reportService.generateFacultyLoadReport(request, user);
        log.info("Faculty load report data size: {}", data.size());
        byte[] bytes = reportService.exportCsv(ReportType.FACULTY_LOAD, data);
        return createFileResponse(bytes, "faculty-load-report-" + LocalDate.now() + ".csv", "text/csv");
    }

    @GetMapping("/submission/export/pdf")
    public ResponseEntity<Resource> exportSubmissionPdf(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - SUBMISSION PDF");
        List<SubmissionReportDto> data = reportService.generateSubmissionReport(request, user);
        log.info("Submission report data size: {}", data.size());
        byte[] bytes = reportService.exportPdf(ReportType.SUBMISSION, data);
        return createFileResponse(bytes, "submission-report-" + LocalDate.now() + ".pdf", "application/pdf");
    }

    @GetMapping("/submission/export/excel")
    public ResponseEntity<Resource> exportSubmissionExcel(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - SUBMISSION EXCEL");
        List<SubmissionReportDto> data = reportService.generateSubmissionReport(request, user);
        log.info("Submission report data size: {}", data.size());
        byte[] bytes = reportService.exportExcel(ReportType.SUBMISSION, data);
        return createFileResponse(bytes, "submission-report-" + LocalDate.now() + ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @GetMapping("/submission/export/csv")
    public ResponseEntity<Resource> exportSubmissionCsv(ReportRequestDto request, @AuthenticationPrincipal User user) {
        log.info("EXPORT ENDPOINT HIT - SUBMISSION CSV");
        List<SubmissionReportDto> data = reportService.generateSubmissionReport(request, user);
        log.info("Submission report data size: {}", data.size());
        byte[] bytes = reportService.exportCsv(ReportType.SUBMISSION, data);
        return createFileResponse(bytes, "submission-report-" + LocalDate.now() + ".csv", "text/csv");
    }

    @GetMapping("/dashboard-summary")
    @Operation(summary = "Get dashboard metrics cards summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardSummary(@AuthenticationPrincipal User user) {
        Map<String, Object> metrics = reportService.getDashboardSummary(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard summary fetched successfully", metrics));
    }

    private ResponseEntity<Resource> createFileResponse(byte[] bytes, String filename, String contentType) {
        ByteArrayResource resource = new ByteArrayResource(bytes);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(bytes.length)
                .body(resource);
    }
}
