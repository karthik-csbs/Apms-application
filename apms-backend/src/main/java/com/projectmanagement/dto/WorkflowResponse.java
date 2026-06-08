package com.projectmanagement.dto;

import com.projectmanagement.entity.ProjectType;
import com.projectmanagement.entity.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {
    private Long id;
    private Long projectId;
    private ProjectType projectType;
    private Integer totalStages;
    private Integer currentStage;
    private WorkflowStatus workflowStatus;
    private LocalDateTime submittedDate;
    private LocalDateTime approvedDate;
    private LocalDateTime completedDate;
    private String remarks;
    private List<WorkflowStageResponse> stages;
}
