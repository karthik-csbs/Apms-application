package com.projectmanagement.report.export;

import com.projectmanagement.report.dto.ReportType;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PdfExportUtil {

    public static byte[] exportToPdf(ReportType type, List<?> data) throws JRException {
        String templateName = null;
        switch (type) {
            case PROJECT:
                templateName = "project-report.jrxml";
                break;
            case REVIEW:
                templateName = "review-report.jrxml";
                break;
            case FACULTY_LOAD:
                templateName = "faculty-load-report.jrxml";
                break;
            case SUBMISSION:
                templateName = "submission-report.jrxml";
                break;
            default:
                throw new IllegalArgumentException("Unknown report type: " + type);
        }

        try {
            InputStream is = new ClassPathResource("jasper/" + templateName).getInputStream();
            JasperReport jasperReport = JasperCompileManager.compileReport(is);
            
            Map<String, Object> parameters = new HashMap<>();
            parameters.put("InstitutionTitle", "PEC Academic Project Management System (APMS)");
            parameters.put("ReportTitle", type.name().replace("_", " ") + " REPORT");
            parameters.put("GeneratedTimestamp", java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (Exception e) {
            throw new JRException("Error generating PDF report: " + e.getMessage(), e);
        }
    }
}
