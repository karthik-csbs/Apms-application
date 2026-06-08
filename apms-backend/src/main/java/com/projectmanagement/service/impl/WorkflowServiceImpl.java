package com.projectmanagement.service.impl;

import com.projectmanagement.dto.*;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.exception.ValidationException;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.WorkflowHistoryRepository;
import com.projectmanagement.repository.WorkflowRepository;
import com.projectmanagement.repository.WorkflowStageRepository;
import com.projectmanagement.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowStageRepository workflowStageRepository;
    private final WorkflowHistoryRepository workflowHistoryRepository;
    private final ProjectRepository projectRepository;

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        if (authentication != null) {
            return authentication.getName();
        }
        return "SYSTEM";
    }

    @Override
    @Transactional
    public WorkflowResponse createWorkflow(Project project) {
        if (workflowRepository.findByProjectId(project.getId()).isPresent()) {
            throw new ValidationException("Workflow already exists for project ID: " + project.getId());
        }

        int totalStages = 1;
        if (project.getProjectType() == ProjectType.MINI) {
            totalStages = 2;
        } else if (project.getProjectType() == ProjectType.MAIN) {
            totalStages = 3;
        }

        Workflow workflow = new Workflow();
        workflow.setProject(project);
        workflow.setProjectType(project.getProjectType());
        workflow.setTotalStages(totalStages);
        workflow.setCurrentStage(1);
        workflow.setWorkflowStatus(WorkflowStatus.DRAFT);
        workflow = workflowRepository.save(workflow);

        List<WorkflowStage> stages = new ArrayList<>();
        for (int i = 1; i <= totalStages; i++) {
            WorkflowStage stage = new WorkflowStage();
            stage.setWorkflow(workflow);
            stage.setStageNumber(i);
            stage.setStageName("Stage " + i);
            stage.setStageStatus(i == 1 ? WorkflowStageStatus.ACTIVE : WorkflowStageStatus.PENDING);
            stages.add(workflowStageRepository.save(stage));
        }

        createHistory(workflow.getId(), project.getId(), 1, null, WorkflowStatus.DRAFT.name(), "CREATE", "Workflow initialized");

        return mapToResponse(workflow, stages);
    }

    @Override
    @Transactional
    public WorkflowResponse submitWorkflow(Long projectId) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));

        if (workflow.getWorkflowStatus() == WorkflowStatus.COMPLETED) {
            throw new ValidationException("Workflow is already completed.");
        }

        WorkflowStatus prevStatus = workflow.getWorkflowStatus();
        workflow.setWorkflowStatus(WorkflowStatus.SUBMITTED);
        workflow.setSubmittedDate(LocalDateTime.now());
        workflowRepository.save(workflow);

        // Find current stage
        WorkflowStage stage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), workflow.getCurrentStage())
                .orElseThrow(() -> new ResourceNotFoundException("Active stage not found for workflow"));

        WorkflowStageStatus prevStageStatus = stage.getStageStatus();
        stage.setStageStatus(WorkflowStageStatus.UNDER_REVIEW);
        workflowStageRepository.save(stage);

        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), prevStatus.name(), WorkflowStatus.SUBMITTED.name(), "SUBMIT", "Workflow submitted for review");
        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), prevStageStatus.name(), WorkflowStageStatus.UNDER_REVIEW.name(), "SUBMIT_STAGE", "Stage submitted for review");

        List<WorkflowStage> stages = workflowStageRepository.findByWorkflowId(workflow.getId());
        return mapToResponse(workflow, stages);
    }

    @Override
    @Transactional
    public WorkflowResponse reviewWorkflow(Long projectId, String remarks) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));

        if (workflow.getWorkflowStatus() == WorkflowStatus.COMPLETED) {
            throw new ValidationException("Workflow is already completed.");
        }

        WorkflowStatus prevStatus = workflow.getWorkflowStatus();
        workflow.setWorkflowStatus(WorkflowStatus.IN_REVIEW);
        workflowRepository.save(workflow);

        WorkflowStage stage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), workflow.getCurrentStage())
                .orElseThrow(() -> new ResourceNotFoundException("Active stage not found for workflow"));

        if (stage.getStageStatus() == WorkflowStageStatus.APPROVED || stage.getStageStatus() == WorkflowStageStatus.COMPLETED) {
            throw new ValidationException("Cannot review an already approved/completed stage.");
        }

        WorkflowStageStatus prevStageStatus = stage.getStageStatus();
        stage.setStageStatus(WorkflowStageStatus.UNDER_REVIEW);
        stage.setRemarks(remarks);
        workflowStageRepository.save(stage);

        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), prevStatus.name(), WorkflowStatus.IN_REVIEW.name(), "REVIEW", remarks);

        List<WorkflowStage> stages = workflowStageRepository.findByWorkflowId(workflow.getId());
        return mapToResponse(workflow, stages);
    }

    @Override
    @Transactional
    public WorkflowResponse approveWorkflow(Long projectId, String remarks) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));

        if (workflow.getWorkflowStatus() == WorkflowStatus.COMPLETED) {
            throw new ValidationException("Workflow is already completed.");
        }

        // Validate stage sequence rules
        int currentStageNumber = workflow.getCurrentStage();
        for (int i = 1; i < currentStageNumber; i++) {
            final int stageNum = i;
            WorkflowStage priorStage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), stageNum)
                    .orElseThrow(() -> new ResourceNotFoundException("Prior stage not found: " + stageNum));
            if (priorStage.getStageStatus() != WorkflowStageStatus.APPROVED && priorStage.getStageStatus() != WorkflowStageStatus.COMPLETED) {
                throw new ValidationException("Rule violation: Prior stage " + stageNum + " must be approved first.");
            }
        }

        WorkflowStage stage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), currentStageNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Active stage not found"));

        if (stage.getStageStatus() == WorkflowStageStatus.REJECTED) {
            throw new ValidationException("Rule violation: Cannot approve a rejected stage without resubmission.");
        }

        WorkflowStageStatus prevStageStatus = stage.getStageStatus();
        stage.setStageStatus(WorkflowStageStatus.APPROVED);
        stage.setReviewedDate(LocalDateTime.now());
        stage.setRemarks(remarks);
        workflowStageRepository.save(stage);

        createHistory(workflow.getId(), projectId, currentStageNumber, prevStageStatus.name(), WorkflowStageStatus.APPROVED.name(), "APPROVE_STAGE", remarks);

        if (currentStageNumber < workflow.getTotalStages()) {
            activateNextStage(projectId);
        } else {
            completeWorkflow(projectId);
        }

        List<WorkflowStage> stages = workflowStageRepository.findByWorkflowId(workflow.getId());
        return mapToResponse(workflow, stages);
    }

    @Override
    @Transactional
    public WorkflowResponse rejectWorkflow(Long projectId, String remarks) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));

        if (workflow.getWorkflowStatus() == WorkflowStatus.COMPLETED) {
            throw new ValidationException("Workflow is already completed.");
        }

        WorkflowStatus prevStatus = workflow.getWorkflowStatus();
        workflow.setWorkflowStatus(WorkflowStatus.REJECTED);
        workflowRepository.save(workflow);

        WorkflowStage stage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), workflow.getCurrentStage())
                .orElseThrow(() -> new ResourceNotFoundException("Active stage not found"));

        WorkflowStageStatus prevStageStatus = stage.getStageStatus();
        stage.setStageStatus(WorkflowStageStatus.REJECTED);
        stage.setRemarks(remarks);
        stage.setReviewedDate(LocalDateTime.now());
        workflowStageRepository.save(stage);

        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), prevStatus.name(), WorkflowStatus.REJECTED.name(), "REJECT", remarks);
        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), prevStageStatus.name(), WorkflowStageStatus.REJECTED.name(), "REJECT_STAGE", remarks);

        List<WorkflowStage> stages = workflowStageRepository.findByWorkflowId(workflow.getId());
        return mapToResponse(workflow, stages);
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowResponse getWorkflow(Long projectId) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));
        List<WorkflowStage> stages = workflowStageRepository.findByWorkflowId(workflow.getId());
        return mapToResponse(workflow, stages);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowHistoryResponse> getWorkflowHistory(Long projectId) {
        return workflowHistoryRepository.findHistoryByProject(projectId).stream()
                .map(this::mapToHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowStageResponse getCurrentStage(Long projectId) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));
        WorkflowStage stage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), workflow.getCurrentStage())
                .orElseThrow(() -> new ResourceNotFoundException("Current stage not found for workflow"));
        return new WorkflowStageResponse(
                stage.getId(),
                stage.getStageNumber(),
                stage.getStageName(),
                stage.getStageStatus(),
                stage.getReviewerId(),
                stage.getReviewedDate(),
                stage.getRemarks()
        );
    }

    @Override
    @Transactional
    public void advanceStage(Long projectId) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));
        int prevStage = workflow.getCurrentStage();
        workflow.setCurrentStage(prevStage + 1);
        workflowRepository.save(workflow);

        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), String.valueOf(prevStage), String.valueOf(workflow.getCurrentStage()), "ADVANCE_STAGE", "Workflow advanced to next stage");
    }

    @Override
    @Transactional
    public void activateNextStage(Long projectId) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));

        WorkflowStage nextStage = workflowStageRepository.findByWorkflowIdAndStageNumber(workflow.getId(), workflow.getCurrentStage() + 1)
                .orElseThrow(() -> new ResourceNotFoundException("Next stage not found"));

        WorkflowStageStatus prevStageStatus = nextStage.getStageStatus();
        nextStage.setStageStatus(WorkflowStageStatus.ACTIVE);
        workflowStageRepository.save(nextStage);

        createHistory(workflow.getId(), projectId, nextStage.getStageNumber(), prevStageStatus.name(), WorkflowStageStatus.ACTIVE.name(), "ACTIVATE_STAGE", "Stage activated");
        advanceStage(projectId);
    }

    @Override
    @Transactional
    public void completeWorkflow(Long projectId) {
        Workflow workflow = workflowRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Workflow not found for project ID: " + projectId));

        // Rule 3: All stages must be approved
        List<WorkflowStage> stages = workflowStageRepository.findByWorkflowId(workflow.getId());
        for (WorkflowStage s : stages) {
            if (s.getStageStatus() != WorkflowStageStatus.APPROVED && s.getStageStatus() != WorkflowStageStatus.COMPLETED) {
                throw new ValidationException("Workflow cannot be completed. Stage " + s.getStageNumber() + " is " + s.getStageStatus());
            }
        }

        WorkflowStatus prevStatus = workflow.getWorkflowStatus();
        workflow.setWorkflowStatus(WorkflowStatus.COMPLETED);
        workflow.setCompletedDate(LocalDateTime.now());
        workflow.setApprovedDate(LocalDateTime.now());
        workflowRepository.save(workflow);

        Project project = workflow.getProject();
        project.setStatus(ProjectStatus.COMPLETED);
        projectRepository.save(project);

        createHistory(workflow.getId(), projectId, workflow.getCurrentStage(), prevStatus.name(), WorkflowStatus.COMPLETED.name(), "COMPLETE", "Workflow marked as COMPLETED");
    }

    private void createHistory(Long workflowId, Long projectId, Integer stageNumber, String prevStatus, String newStatus, String action, String remarks) {
        WorkflowHistory history = new WorkflowHistory();
        history.setWorkflowId(workflowId);
        history.setProjectId(projectId);
        history.setStageNumber(stageNumber);
        history.setPreviousStatus(prevStatus);
        history.setNewStatus(newStatus);
        history.setAction(action);
        history.setRemarks(remarks);
        history.setPerformedBy(getCurrentUsername());
        history.setPerformedDate(LocalDateTime.now());
        workflowHistoryRepository.save(history);
    }

    private WorkflowResponse mapToResponse(Workflow w, List<WorkflowStage> stages) {
        List<WorkflowStageResponse> stageResponses = stages.stream()
                .map(s -> new WorkflowStageResponse(s.getId(), s.getStageNumber(), s.getStageName(), s.getStageStatus(), s.getReviewerId(), s.getReviewedDate(), s.getRemarks()))
                .collect(Collectors.toList());

        return new WorkflowResponse(
                w.getId(),
                w.getProject().getId(),
                w.getProjectType(),
                w.getTotalStages(),
                w.getCurrentStage(),
                w.getWorkflowStatus(),
                w.getSubmittedDate(),
                w.getApprovedDate(),
                w.getCompletedDate(),
                w.getRemarks(),
                stageResponses
        );
    }

    private WorkflowHistoryResponse mapToHistoryResponse(WorkflowHistory h) {
        return new WorkflowHistoryResponse(h.getId(), h.getWorkflowId(), h.getProjectId(), h.getStageNumber(), h.getPreviousStatus(), h.getNewStatus(), h.getAction(), h.getRemarks(), h.getPerformedBy(), h.getPerformedDate());
    }
}
