package com.projectmanagement.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfPCell;
import com.projectmanagement.entity.Certificate;
import com.projectmanagement.entity.Project;
import com.projectmanagement.entity.Student;
import com.projectmanagement.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CertificateService {

    @Value("${app.certificate.storage.path}")
    private String certificateStoragePath;

    private final CertificateRepository certificateRepository;

    public Certificate generateCertificate(Project project, Student student) {
        try {
            // Ensure directory exists
            File directory = new File(certificateStoragePath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = "certificate_" + project.getId() + "_" + student.getRegisterNumber() + ".pdf";
            String filePath = certificateStoragePath + fileName;

            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(filePath));

            document.open();

            // Add College Header
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.BLUE);
            Paragraph collegeName = new Paragraph("PRATHYUSHA ENGINEERING COLLEGE", titleFont);
            collegeName.setAlignment(Element.ALIGN_CENTER);
            document.add(collegeName);

            document.add(new Paragraph("\n"));

            // Add Certificate Title
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph certTitle = new Paragraph("CERTIFICATE OF COMPLETION", subtitleFont);
            certTitle.setAlignment(Element.ALIGN_CENTER);
            document.add(certTitle);

            document.add(new Paragraph("\n\n"));

            // Add Certificate Content
            Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 14);
            Paragraph content = new Paragraph();
            content.setFont(contentFont);
            content.add("This is to certify that ");
            content.add(new Chunk(student.getName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            content.add(" (Register Number: " + student.getRegisterNumber() + ") of the Department of ");
            content.add(project.getDepartment().getName());
            content.add(" has successfully completed the ");
            content.add(project.getProjectType().name() + " Project");
            content.add(" titled \"");
            content.add(new Chunk(project.getTitle(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14)));
            content.add("\" under the guidance of ");
            content.add(project.getFacultyGuide().getName() + ".\n\n");
            
            content.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(content);

            // Add Date
            document.add(new Paragraph("Date of Completion: " + LocalDateTime.now().toLocalDate(), contentFont));
            document.add(new Paragraph("\n\n\n\n"));

            // Add Signatures
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            
            PdfPCell guideCell = new PdfPCell(new Phrase("Project Guide\n(" + project.getFacultyGuide().getName() + ")"));
            guideCell.setBorder(Rectangle.NO_BORDER);
            guideCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            
            PdfPCell hodCell = new PdfPCell(new Phrase("Head of Department"));
            hodCell.setBorder(Rectangle.NO_BORDER);
            hodCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            
            PdfPCell principalCell = new PdfPCell(new Phrase("Principal"));
            principalCell.setBorder(Rectangle.NO_BORDER);
            principalCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            
            table.addCell(guideCell);
            table.addCell(hodCell);
            table.addCell(principalCell);
            
            document.add(table);
            document.close();

            // Save to DB
            Certificate certificate = new Certificate();
            certificate.setProject(project);
            certificate.setStudent(student);
            certificate.setCertificateUrl(filePath);
            return certificateRepository.save(certificate);

        } catch (Exception e) {
            throw new RuntimeException("Error generating certificate: " + e.getMessage(), e);
        }
    }
}
