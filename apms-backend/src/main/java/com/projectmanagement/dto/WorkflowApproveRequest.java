package com.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowApproveRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;
    private String remarks;
}
