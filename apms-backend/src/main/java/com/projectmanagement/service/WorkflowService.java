package com.projectmanagement.service;

import com.projectmanagement.dto.WorkflowHistoryResponse;
import com.projectmanagement.dto.WorkflowResponse;
import com.projectmanagement.dto.WorkflowStageResponse;
import com.projectmanagement.entity.Project;
import java.util.List;

public interface WorkflowService {
    WorkflowResponse createWorkflow(Project project);
    WorkflowResponse submitWorkflow(Long projectId);
    WorkflowResponse reviewWorkflow(Long projectId, String remarks);
    WorkflowResponse approveWorkflow(Long projectId, String remarks);
    WorkflowResponse rejectWorkflow(Long projectId, String remarks);
    WorkflowResponse getWorkflow(Long projectId);
    List<WorkflowHistoryResponse> getWorkflowHistory(Long projectId);
    WorkflowStageResponse getCurrentStage(Long projectId);
    void advanceStage(Long projectId);
    void activateNextStage(Long projectId);
    void completeWorkflow(Long projectId);
}
