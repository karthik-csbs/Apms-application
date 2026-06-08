package com.projectmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkflowSubmitRequest {
    @NotNull(message = "Project ID is required")
    private Long projectId;
}
