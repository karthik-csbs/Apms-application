package com.projectmanagement;

import com.projectmanagement.dto.WorkflowResponse;
import com.projectmanagement.entity.*;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.WorkflowHistoryRepository;
import com.projectmanagement.repository.WorkflowRepository;
import com.projectmanagement.repository.WorkflowStageRepository;
import com.projectmanagement.service.impl.WorkflowServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkflowServiceTest {

    @Mock
    private WorkflowRepository workflowRepository;

    @Mock
    private WorkflowStageRepository workflowStageRepository;

    @Mock
    private WorkflowHistoryRepository workflowHistoryRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private WorkflowServiceImpl workflowService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @Mock
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testCreateWorkflow_MicroProject() {
        // Arrange
        Project project = new Project();
        project.setId(1L);
        project.setProjectType(ProjectType.MICRO);

        when(workflowRepository.findByProjectId(1L)).thenReturn(Optional.empty());
        when(workflowRepository.save(any(Workflow.class))).thenAnswer(invocation -> {
            Workflow w = invocation.getArgument(0);
            w.setId(10L);
            return w;
        });
        when(workflowStageRepository.save(any(WorkflowStage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        WorkflowResponse response = workflowService.createWorkflow(project);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getTotalStages());
        assertEquals(WorkflowStatus.DRAFT, response.getWorkflowStatus());
        verify(workflowRepository, times(1)).save(any(Workflow.class));
        verify(workflowStageRepository, times(1)).save(any(WorkflowStage.class));
    }

    @Test
    void testSubmitWorkflow_Success() {
        // Arrange
        Long projectId = 1L;
        Project project = new Project();
        project.setId(projectId);
        project.setProjectType(ProjectType.MICRO);

        Workflow workflow = new Workflow();
        workflow.setId(10L);
        workflow.setProject(project);
        workflow.setProjectType(ProjectType.MICRO);
        workflow.setTotalStages(1);
        workflow.setCurrentStage(1);
        workflow.setWorkflowStatus(WorkflowStatus.DRAFT);

        WorkflowStage stage = new WorkflowStage();
        stage.setId(20L);
        stage.setWorkflow(workflow);
        stage.setStageNumber(1);
        stage.setStageStatus(WorkflowStageStatus.ACTIVE);

        when(workflowRepository.findByProjectId(projectId)).thenReturn(Optional.of(workflow));
        when(workflowStageRepository.findByWorkflowIdAndStageNumber(10L, 1)).thenReturn(Optional.of(stage));
        when(workflowStageRepository.findByWorkflowId(10L)).thenReturn(List.of(stage));

        // Act
        WorkflowResponse response = workflowService.submitWorkflow(projectId);

        // Assert
        assertNotNull(response);
        assertEquals(WorkflowStatus.SUBMITTED, response.getWorkflowStatus());
        assertEquals(WorkflowStageStatus.UNDER_REVIEW, response.getStages().get(0).getStageStatus());
    }
}
