package com.projectmanagement.report.service.impl;

import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.exception.ReportDataNotFoundException;
import com.projectmanagement.repository.*;
import com.projectmanagement.report.dto.*;
import com.projectmanagement.report.export.CsvExportUtil;
import com.projectmanagement.report.export.ExcelExportUtil;
import com.projectmanagement.report.export.PdfExportUtil;
import com.projectmanagement.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final ProjectRepository projectRepository;
    private final FacultyRepository facultyRepository;
    private final SubmissionRepository submissionRepository;
    private final WorkflowStageRepository workflowStageRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    private Department getDepartmentForUser(User user) {
        if (user.getRole() == Role.HOD || user.getRole() == Role.FACULTY) {
            Faculty faculty = facultyRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found for email: " + user.getEmail()));
            return faculty.getDepartment();
        }
        return null;
    }

    @Override
    public List<ProjectReportDto> generateProjectReport(ReportRequestDto request, User loggedInUser) {
        StringBuilder jpql = new StringBuilder("SELECT p FROM Project p LEFT JOIN FETCH p.department LEFT JOIN FETCH p.facultyGuide LEFT JOIN FETCH p.teamLead LEFT JOIN FETCH p.workflow WHERE 1=1");
        
        applyRoleRestrictions(jpql, loggedInUser, "p.department.id", "p.facultyGuide.id");
        applyProjectFilters(jpql, request);

        TypedQuery<Project> query = entityManager.createQuery(jpql.toString(), Project.class);
        setFilterParameters(query, request, loggedInUser);

        return query.getResultList().stream().map(p -> ProjectReportDto.builder()
                .projectId(p.getId())
                .projectTitle(p.getTitle())
                .projectType(p.getProjectType() != null ? p.getProjectType().name() : "N/A")
                .projectStatus(p.getStatus() != null ? p.getStatus().name() : "N/A")
                .workflowStatus(p.getWorkflow() != null && p.getWorkflow().getWorkflowStatus() != null ? p.getWorkflow().getWorkflowStatus().name() : "N/A")
                .guideName(p.getFacultyGuide() != null ? p.getFacultyGuide().getName() : "N/A")
                .teamName(p.getTeamLead() != null ? p.getTeamLead().getName() + "'s Team" : "N/A")
                .createdDate(p.getCreatedAt())
                .completedDate(p.getWorkflow() != null ? p.getWorkflow().getCompletedDate() : null)
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    public List<ReviewReportDto> generateReviewReport(ReportRequestDto request, User loggedInUser) {
        StringBuilder jpql = new StringBuilder("SELECT ws FROM WorkflowStage ws JOIN FETCH ws.workflow w JOIN FETCH w.project p LEFT JOIN FETCH p.department LEFT JOIN FETCH p.facultyGuide WHERE 1=1");
        
        applyRoleRestrictions(jpql, loggedInUser, "p.department.id", "p.facultyGuide.id");
        applyReviewFilters(jpql, request);

        TypedQuery<WorkflowStage> query = entityManager.createQuery(jpql.toString(), WorkflowStage.class);
        setFilterParameters(query, request, loggedInUser);

        List<WorkflowStage> stages = query.getResultList();
        List<ReviewReportDto> dtos = new ArrayList<>();

        for (WorkflowStage ws : stages) {
            String reviewerName = "N/A";
            if (ws.getReviewerId() != null) {
                reviewerName = userRepository.findById(ws.getReviewerId())
                        .map(User::getName)
                        .orElse("Unknown Reviewer");
            }
            
            dtos.add(ReviewReportDto.builder()
                    .reviewId(ws.getId())
                    .projectName(ws.getWorkflow().getProject().getTitle())
                    .reviewer(reviewerName)
                    .stage("Stage " + ws.getStageNumber() + ": " + ws.getStageName())
                    .reviewDate(ws.getReviewedDate())
                    .score("N/A") // Score is not modeled in entities
                    .comments(ws.getRemarks())
                    .status(ws.getStageStatus() != null ? ws.getStageStatus().name() : "N/A")
                    .build());
        }
        return dtos;
    }

    @Override
    public List<FacultyLoadReportDto> generateFacultyLoadReport(ReportRequestDto request, User loggedInUser) {
        StringBuilder jpql = new StringBuilder("SELECT f FROM Faculty f LEFT JOIN FETCH f.department WHERE 1=1");
        
        if (loggedInUser.getRole() == Role.HOD) {
            jpql.append(" AND f.department.id = :hodDeptId");
        } else if (loggedInUser.getRole() == Role.FACULTY) {
            jpql.append(" AND f.id = :facultyUserId");
        }
        
        if (request.getDepartmentId() != null && loggedInUser.getRole() != Role.HOD) {
            jpql.append(" AND f.department.id = :deptId");
        }
        if (request.getFacultyId() != null && loggedInUser.getRole() == Role.FACULTY) {
            jpql.append(" AND f.id = :facId");
        }

        TypedQuery<Faculty> query = entityManager.createQuery(jpql.toString(), Faculty.class);
        
        if (loggedInUser.getRole() == Role.HOD) {
            Department dept = getDepartmentForUser(loggedInUser);
            query.setParameter("hodDeptId", dept != null ? dept.getId() : -1L);
        } else if (loggedInUser.getRole() == Role.FACULTY) {
            query.setParameter("facultyUserId", loggedInUser.getId());
        }
        
        if (request.getDepartmentId() != null && loggedInUser.getRole() != Role.HOD) {
            query.setParameter("deptId", request.getDepartmentId());
        }
        if (request.getFacultyId() != null && loggedInUser.getRole() == Role.FACULTY) {
            query.setParameter("facId", request.getFacultyId());
        }

        List<Faculty> faculties = query.getResultList();
        List<FacultyLoadReportDto> dtos = new ArrayList<>();

        for (Faculty f : faculties) {
            Long assigned = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.facultyGuide.id = :fId", Long.class)
                    .setParameter("fId", f.getId())
                    .getSingleResult();

            Long completed = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.facultyGuide.id = :fId AND p.status = :status", Long.class)
                    .setParameter("fId", f.getId())
                    .setParameter("status", ProjectStatus.COMPLETED)
                    .getSingleResult();

            Long pending = entityManager.createQuery("SELECT COUNT(ws) FROM WorkflowStage ws WHERE ws.reviewerId = :fId AND ws.stageStatus = :status", Long.class)
                    .setParameter("fId", f.getId())
                    .setParameter("status", WorkflowStageStatus.UNDER_REVIEW)
                    .getSingleResult();

            Long active = entityManager.createQuery("SELECT COUNT(ws) FROM WorkflowStage ws WHERE ws.reviewerId = :fId AND ws.stageStatus = :status", Long.class)
                    .setParameter("fId", f.getId())
                    .setParameter("status", WorkflowStageStatus.ACTIVE)
                    .getSingleResult();

            dtos.add(FacultyLoadReportDto.builder()
                    .facultyId(f.getId())
                    .facultyName(f.getName())
                    .department(f.getDepartment() != null ? f.getDepartment().getName() : "N/A")
                    .assignedProjects(assigned)
                    .completedProjects(completed)
                    .pendingReviews(pending)
                    .activeReviews(active)
                    .build());
        }
        return dtos;
    }

    @Override
    public List<SubmissionReportDto> generateSubmissionReport(ReportRequestDto request, User loggedInUser) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Submission s JOIN FETCH s.project p JOIN FETCH s.student st LEFT JOIN p.department LEFT JOIN p.facultyGuide WHERE 1=1");
        
        applyRoleRestrictions(jpql, loggedInUser, "p.department.id", "p.facultyGuide.id");
        applySubmissionFilters(jpql, request);

        TypedQuery<Submission> query = entityManager.createQuery(jpql.toString(), Submission.class);
        setFilterParameters(query, request, loggedInUser);

        return query.getResultList().stream().map(s -> SubmissionReportDto.builder()
                .submissionId(s.getId())
                .projectName(s.getProject().getTitle())
                .submittedBy(s.getStudent().getName())
                .submissionDate(s.getSubmittedAt())
                .gitHubUrl(s.getGithubUrl())
                .documentationUrl(s.getDocumentUrl())
                .status(s.getProject().getCompletionStatus() != null ? s.getProject().getCompletionStatus() : "SUBMITTED")
                .build()
        ).collect(Collectors.toList());
    }

    private void applyRoleRestrictions(StringBuilder jpql, User user, String deptField, String guideField) {
        if (user.getRole() == Role.HOD) {
            jpql.append(" AND ").append(deptField).append(" = :hodDeptId");
        } else if (user.getRole() == Role.FACULTY) {
            jpql.append(" AND ").append(guideField).append(" = :facultyUserId");
        }
    }

    private void applyProjectFilters(StringBuilder jpql, ReportRequestDto request) {
        if (request.getDepartmentId() != null) jpql.append(" AND p.department.id = :deptId");
        if (request.getFacultyId() != null) jpql.append(" AND p.facultyGuide.id = :facultyId");
        if (request.getProjectType() != null && !request.getProjectType().trim().isEmpty()) jpql.append(" AND p.projectType = :projectType");
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) jpql.append(" AND p.status = :status");
        if (request.getFromDate() != null) jpql.append(" AND p.createdAt >= :fromDate");
        if (request.getToDate() != null) jpql.append(" AND p.createdAt <= :toDate");
    }

    private void applyReviewFilters(StringBuilder jpql, ReportRequestDto request) {
        if (request.getDepartmentId() != null) jpql.append(" AND p.department.id = :deptId");
        if (request.getFacultyId() != null) jpql.append(" AND (ws.reviewerId = :facultyId OR p.facultyGuide.id = :facultyId)");
        if (request.getProjectType() != null && !request.getProjectType().trim().isEmpty()) jpql.append(" AND p.projectType = :projectType");
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) jpql.append(" AND ws.stageStatus = :status");
        if (request.getFromDate() != null) jpql.append(" AND ws.reviewedDate >= :fromDate");
        if (request.getToDate() != null) jpql.append(" AND ws.reviewedDate <= :toDate");
    }

    private void applySubmissionFilters(StringBuilder jpql, ReportRequestDto request) {
        if (request.getDepartmentId() != null) jpql.append(" AND p.department.id = :deptId");
        if (request.getFacultyId() != null) jpql.append(" AND p.facultyGuide.id = :facultyId");
        if (request.getProjectType() != null && !request.getProjectType().trim().isEmpty()) jpql.append(" AND p.projectType = :projectType");
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) jpql.append(" AND p.completionStatus = :status");
        if (request.getFromDate() != null) jpql.append(" AND s.submittedAt >= :fromDate");
        if (request.getToDate() != null) jpql.append(" AND s.submittedAt <= :toDate");
    }

    private void setFilterParameters(TypedQuery<?> query, ReportRequestDto request, User user) {
        log.info("Setting query filter parameters. Request filters: departmentId={}, facultyId={}, projectType={}, status={}, fromDate={}, toDate={}",
                request.getDepartmentId(), request.getFacultyId(), request.getProjectType(), request.getStatus(), request.getFromDate(), request.getToDate());
        
        if (user.getRole() == Role.HOD) {
            Department dept = getDepartmentForUser(user);
            query.setParameter("hodDeptId", dept != null ? dept.getId() : -1L);
        } else if (user.getRole() == Role.FACULTY) {
            query.setParameter("facultyUserId", user.getId());
        }

        if (request.getDepartmentId() != null) query.setParameter("deptId", request.getDepartmentId());
        if (request.getFacultyId() != null) query.setParameter("facultyId", request.getFacultyId());
        
        if (request.getProjectType() != null && !request.getProjectType().trim().isEmpty()) {
            try {
                query.setParameter("projectType", ProjectType.valueOf(request.getProjectType()));
            } catch (IllegalArgumentException e) {
                query.setParameter("projectType", null);
            }
        }
        
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            // Determine if query is for Project or WorkflowStage
            String queryStr = query.unwrap(org.hibernate.query.Query.class).getQueryString();
            if (queryStr.contains("WorkflowStage ws")) {
                try {
                    query.setParameter("status", WorkflowStageStatus.valueOf(request.getStatus()));
                } catch (IllegalArgumentException e) {
                    query.setParameter("status", null);
                }
            } else {
                try {
                    query.setParameter("status", ProjectStatus.valueOf(request.getStatus()));
                } catch (IllegalArgumentException e) {
                    query.setParameter("status", null);
                }
            }
        }

        if (request.getFromDate() != null) {
            query.setParameter("fromDate", request.getFromDate().atStartOfDay());
        }
        if (request.getToDate() != null) {
            query.setParameter("toDate", request.getToDate().atTime(LocalTime.MAX));
        }
    }

    @Override
    public byte[] exportPdf(ReportType type, List<?> data) {
        if (data == null) {
            throw new ReportDataNotFoundException("No report data available");
        }
        log.info("exportPdf: report type={}, data size={}", type, data.size());
        try {
            return PdfExportUtil.exportToPdf(type, data);
        } catch (Exception e) {
            log.error("Error generating PDF export", e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] exportExcel(ReportType type, List<?> data) {
        if (data == null) {
            throw new ReportDataNotFoundException("No report data available");
        }
        log.info("exportExcel: report type={}, data size={}", type, data.size());
        try {
            return ExcelExportUtil.exportToExcel(type, data);
        } catch (IOException e) {
            log.error("Error generating Excel export", e);
            throw new RuntimeException("Failed to generate Excel: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] exportCsv(ReportType type, List<?> data) {
        if (data == null) {
            throw new ReportDataNotFoundException("No report data available");
        }
        log.info("exportCsv: report type={}, data size={}", type, data.size());
        try {
            return CsvExportUtil.exportToCsv(type, data);
        } catch (IOException e) {
            log.error("Error generating CSV export", e);
            throw new RuntimeException("Failed to generate CSV: " + e.getMessage(), e);
        }
    }

    @Override
    public java.util.Map<String, Object> getDashboardSummary(User loggedInUser) {
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        Role role = loggedInUser.getRole();
        Long totalProjects = 0L;
        Long completedProjects = 0L;
        Long pendingReviews = 0L;
        Long facultyLoad = 0L;
        Long submissionCount = 0L;

        if (role == Role.ADMIN || role == Role.PRINCIPAL) {
            totalProjects = entityManager.createQuery("SELECT COUNT(p) FROM Project p", Long.class).getSingleResult();
            completedProjects = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.status = :status", Long.class)
                    .setParameter("status", ProjectStatus.COMPLETED).getSingleResult();
            pendingReviews = entityManager.createQuery("SELECT COUNT(ws) FROM WorkflowStage ws WHERE ws.stageStatus = :status", Long.class)
                    .setParameter("status", WorkflowStageStatus.UNDER_REVIEW).getSingleResult();
            facultyLoad = entityManager.createQuery("SELECT COUNT(f) FROM Faculty f", Long.class).getSingleResult();
            submissionCount = entityManager.createQuery("SELECT COUNT(s) FROM Submission s", Long.class).getSingleResult();
        } else if (role == Role.HOD) {
            Department dept = getDepartmentForUser(loggedInUser);
            Long deptId = dept != null ? dept.getId() : -1L;

            totalProjects = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.department.id = :deptId", Long.class)
                    .setParameter("deptId", deptId).getSingleResult();
            completedProjects = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.department.id = :deptId AND p.status = :status", Long.class)
                    .setParameter("deptId", deptId).setParameter("status", ProjectStatus.COMPLETED).getSingleResult();
            pendingReviews = entityManager.createQuery("SELECT COUNT(ws) FROM WorkflowStage ws JOIN ws.workflow w JOIN w.project p WHERE p.department.id = :deptId AND ws.stageStatus = :status", Long.class)
                    .setParameter("deptId", deptId).setParameter("status", WorkflowStageStatus.UNDER_REVIEW).getSingleResult();
            facultyLoad = entityManager.createQuery("SELECT COUNT(f) FROM Faculty f WHERE f.department.id = :deptId", Long.class)
                    .setParameter("deptId", deptId).getSingleResult();
            submissionCount = entityManager.createQuery("SELECT COUNT(s) FROM Submission s JOIN s.project p WHERE p.department.id = :deptId", Long.class)
                    .setParameter("deptId", deptId).getSingleResult();
        } else if (role == Role.FACULTY) {
            Long facId = loggedInUser.getId();

            totalProjects = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.facultyGuide.id = :facId", Long.class)
                    .setParameter("facId", facId).getSingleResult();
            completedProjects = entityManager.createQuery("SELECT COUNT(p) FROM Project p WHERE p.facultyGuide.id = :facId AND p.status = :status", Long.class)
                    .setParameter("facId", facId).setParameter("status", ProjectStatus.COMPLETED).getSingleResult();
            pendingReviews = entityManager.createQuery("SELECT COUNT(ws) FROM WorkflowStage ws JOIN ws.workflow w JOIN w.project p WHERE (ws.reviewerId = :facId OR p.facultyGuide.id = :facId) AND ws.stageStatus = :status", Long.class)
                    .setParameter("facId", facId).setParameter("status", WorkflowStageStatus.UNDER_REVIEW).getSingleResult();
            facultyLoad = totalProjects; // Faculty load for a guide is their assigned projects count
            submissionCount = entityManager.createQuery("SELECT COUNT(s) FROM Submission s JOIN s.project p WHERE p.facultyGuide.id = :facId", Long.class)
                    .setParameter("facId", facId).getSingleResult();
        }

        summary.put("totalProjects", totalProjects);
        summary.put("completedProjects", completedProjects);
        summary.put("pendingReviews", pendingReviews);
        summary.put("facultyLoad", facultyLoad);
        summary.put("submissionCount", submissionCount);
        return summary;
    }
}
