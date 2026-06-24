package com.projectmanagement.report.export;

import com.projectmanagement.report.dto.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExcelExportUtil {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static byte[] exportToExcel(ReportType type, List<?> data) throws IOException {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet(type.name() + " Report");
            if (sheet instanceof SXSSFSheet) {
                ((SXSSFSheet) sheet).trackAllColumnsForAutoSizing();
            }

            // Fonts & Styles
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            CellStyle cellStyle = workbook.createCellStyle();
            cellStyle.setBorderBottom(BorderStyle.THIN);
            cellStyle.setBorderTop(BorderStyle.THIN);
            cellStyle.setBorderLeft(BorderStyle.THIN);
            cellStyle.setBorderRight(BorderStyle.THIN);

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

            // Create header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            int rowIdx = 1;
            for (Object obj : data) {
                Row row = sheet.createRow(rowIdx++);
                switch (type) {
                    case PROJECT:
                        ProjectReportDto p = (ProjectReportDto) obj;
                        createCell(row, 0, p.getProjectId(), cellStyle);
                        createCell(row, 1, p.getProjectTitle(), cellStyle);
                        createCell(row, 2, p.getProjectType(), cellStyle);
                        createCell(row, 3, p.getProjectStatus(), cellStyle);
                        createCell(row, 4, p.getWorkflowStatus(), cellStyle);
                        createCell(row, 5, p.getGuideName(), cellStyle);
                        createCell(row, 6, p.getTeamName(), cellStyle);
                        createCell(row, 7, p.getCreatedDate(), cellStyle);
                        createCell(row, 8, p.getCompletedDate(), cellStyle);
                        break;
                    case REVIEW:
                        ReviewReportDto r = (ReviewReportDto) obj;
                        createCell(row, 0, r.getReviewId(), cellStyle);
                        createCell(row, 1, r.getProjectName(), cellStyle);
                        createCell(row, 2, r.getReviewer(), cellStyle);
                        createCell(row, 3, r.getStage(), cellStyle);
                        createCell(row, 4, r.getReviewDate(), cellStyle);
                        createCell(row, 5, r.getScore(), cellStyle);
                        createCell(row, 6, r.getComments(), cellStyle);
                        createCell(row, 7, r.getStatus(), cellStyle);
                        break;
                    case FACULTY_LOAD:
                        FacultyLoadReportDto f = (FacultyLoadReportDto) obj;
                        createCell(row, 0, f.getFacultyId(), cellStyle);
                        createCell(row, 1, f.getFacultyName(), cellStyle);
                        createCell(row, 2, f.getDepartment(), cellStyle);
                        createCell(row, 3, f.getAssignedProjects(), cellStyle);
                        createCell(row, 4, f.getCompletedProjects(), cellStyle);
                        createCell(row, 5, f.getPendingReviews(), cellStyle);
                        createCell(row, 6, f.getActiveReviews(), cellStyle);
                        break;
                    case SUBMISSION:
                        SubmissionReportDto s = (SubmissionReportDto) obj;
                        createCell(row, 0, s.getSubmissionId(), cellStyle);
                        createCell(row, 1, s.getProjectName(), cellStyle);
                        createCell(row, 2, s.getSubmittedBy(), cellStyle);
                        createCell(row, 3, s.getSubmissionDate(), cellStyle);
                        createCell(row, 4, s.getGitHubUrl(), cellStyle);
                        createCell(row, 5, s.getDocumentationUrl(), cellStyle);
                        createCell(row, 6, s.getStatus(), cellStyle);
                        break;
                }
            }

            // Auto-size columns safely
            try {
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }
            } catch (Exception e) {
                // Log and swallow graphics environment exception in headless environments
            }

            workbook.write(out);
            out.flush();
            byte[] bytes = out.toByteArray();
            workbook.dispose();
            return bytes;
        }
    }

    private static void createCell(Row row, int column, Object value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellStyle(style);
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(((LocalDateTime) value).format(DATE_FORMATTER));
        } else {
            cell.setCellValue(value.toString());
        }
    }
}
