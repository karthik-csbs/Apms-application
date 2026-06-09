package com.projectmanagement.report.export;

import com.opencsv.CSVWriter;
import com.projectmanagement.report.dto.*;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class CsvExportUtil {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static byte[] exportToCsv(ReportType type, List<?> data) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             CSVWriter csvWriter = new CSVWriter(writer)) {

            String[] headers;
            switch (type) {
                case PROJECT:
                    headers = new String[]{"Project ID", "Project Title", "Project Type", "Project Status", "Workflow Status", "Guide Name", "Team Name", "Created Date", "Completed Date"};
                    break;
                case REVIEW:
                    headers = new String[]{"Review ID", "Project Name", "Reviewer", "Stage", "Review Date", "Score", "Comments", "Status"};
                    break;
                case FACULTY_LOAD:
                    headers = new String[]{"Faculty ID", "Faculty Name", "Department", "Assigned Projects", "Completed Projects", "Pending Reviews", "Active Reviews"};
                    break;
                case SUBMISSION:
                    headers = new String[]{"Submission ID", "Project Name", "Submitted By", "Submission Date", "GitHub URL", "Documentation URL", "Status"};
                    break;
                default:
                    throw new IllegalArgumentException("Unknown report type: " + type);
            }

            csvWriter.writeNext(headers);

            for (Object obj : data) {
                String[] row = new String[headers.length];
                switch (type) {
                    case PROJECT:
                        ProjectReportDto p = (ProjectReportDto) obj;
                        row[0] = formatValue(p.getProjectId());
                        row[1] = formatValue(p.getProjectTitle());
                        row[2] = formatValue(p.getProjectType());
                        row[3] = formatValue(p.getProjectStatus());
                        row[4] = formatValue(p.getWorkflowStatus());
                        row[5] = formatValue(p.getGuideName());
                        row[6] = formatValue(p.getTeamName());
                        row[7] = formatValue(p.getCreatedDate());
                        row[8] = formatValue(p.getCompletedDate());
                        break;
                    case REVIEW:
                        ReviewReportDto r = (ReviewReportDto) obj;
                        row[0] = formatValue(r.getReviewId());
                        row[1] = formatValue(r.getProjectName());
                        row[2] = formatValue(r.getReviewer());
                        row[3] = formatValue(r.getStage());
                        row[4] = formatValue(r.getReviewDate());
                        row[5] = formatValue(r.getScore());
                        row[6] = formatValue(r.getComments());
                        row[7] = formatValue(r.getStatus());
                        break;
                    case FACULTY_LOAD:
                        FacultyLoadReportDto f = (FacultyLoadReportDto) obj;
                        row[0] = formatValue(f.getFacultyId());
                        row[1] = formatValue(f.getFacultyName());
                        row[2] = formatValue(f.getDepartment());
                        row[3] = formatValue(f.getAssignedProjects());
                        row[4] = formatValue(f.getCompletedProjects());
                        row[5] = formatValue(f.getPendingReviews());
                        row[6] = formatValue(f.getActiveReviews());
                        break;
                    case SUBMISSION:
                        SubmissionReportDto s = (SubmissionReportDto) obj;
                        row[0] = formatValue(s.getSubmissionId());
                        row[1] = formatValue(s.getProjectName());
                        row[2] = formatValue(s.getSubmittedBy());
                        row[3] = formatValue(s.getSubmissionDate());
                        row[4] = formatValue(s.getGitHubUrl());
                        row[5] = formatValue(s.getDocumentationUrl());
                        row[6] = formatValue(s.getStatus());
                        break;
                }
                csvWriter.writeNext(row);
            }

            csvWriter.flush();
            return out.toByteArray();
        }
    }

    private static String formatValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof LocalDateTime) {
            return ((LocalDateTime) value).format(DATE_FORMATTER);
        }
        return value.toString();
    }
}
