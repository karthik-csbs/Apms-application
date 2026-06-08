package com.projectmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowHistoryResponse {
    private Long id;
    private Long workflowId;
    private Long projectId;
    private Integer stageNumber;
    private String previousStatus;
    private String newStatus;
    private String action;
    private String remarks;
    private String performedBy;
    private LocalDateTime performedDate;
}
