package com.projectmanagement.dto;

import com.projectmanagement.entity.WorkflowStageStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStageResponse {
    private Long id;
    private Integer stageNumber;
    private String stageName;
    private WorkflowStageStatus stageStatus;
    private Long reviewerId;
    private LocalDateTime reviewedDate;
    private String remarks;
}
