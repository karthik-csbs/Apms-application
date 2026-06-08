package com.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowRejectRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;
    
    @NotNull(message = "Remarks are required for rejection")
    private String remarks;
}
