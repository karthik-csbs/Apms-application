package com.projectmanagement;

import com.projectmanagement.entity.*;
import com.projectmanagement.report.dto.*;
import com.projectmanagement.report.service.impl.ReportServiceImpl;
import com.projectmanagement.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private FacultyRepository facultyRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private WorkflowStageRepository workflowStageRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private ReportServiceImpl reportService;

    @Test
    void testGenerateProjectReport_Admin() {
        User admin = new User();
        admin.setId(1L);
        admin.setRole(Role.ADMIN);

        ReportRequestDto request = new ReportRequestDto();
        request.setReportType(ReportType.PROJECT);

        Project project = new Project();
        project.setId(10L);
        project.setTitle("APMS Report Module");
        project.setProjectType(ProjectType.MAIN);
        project.setStatus(ProjectStatus.PENDING);
        project.setCreatedAt(LocalDateTime.now());

        TypedQuery<Project> query = mock(TypedQuery.class);
        when(entityManager.createQuery(anyString(), eq(Project.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(project));

        List<ProjectReportDto> result = reportService.generateProjectReport(request, admin);
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("APMS Report Module", result.get(0).getProjectTitle());
    }

    @Test
    void testGetDashboardSummary_Admin() {
        User admin = new User();
        admin.setId(1L);
        admin.setRole(Role.ADMIN);

        TypedQuery<Long> countQuery = mock(TypedQuery.class);
        when(entityManager.createQuery(anyString(), eq(Long.class))).thenReturn(countQuery);
        when(countQuery.setParameter(anyString(), any())).thenReturn(countQuery);
        when(countQuery.getSingleResult()).thenReturn(5L);

        Map<String, Object> summary = reportService.getDashboardSummary(admin);
        assertNotNull(summary);
        assertEquals(5L, summary.get("totalProjects"));
    }

    @Test
    void testExportPdf_Project() {
        ProjectReportDto dto = new ProjectReportDto();
        dto.setProjectId(10L);
        dto.setProjectTitle("APMS Report Module");
        dto.setProjectType("MAIN");
        dto.setProjectStatus("PENDING");
        dto.setWorkflowStatus("UNDER_REVIEW");
        dto.setGuideName("Dr. Smith");
        dto.setTeamName("Team A");
        dto.setCreatedDate(LocalDateTime.now());
        dto.setCompletedDate(LocalDateTime.now());

        byte[] pdfBytes = reportService.exportPdf(ReportType.PROJECT, Collections.singletonList(dto));
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }
}

