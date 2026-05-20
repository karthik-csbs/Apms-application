package com.projectmanagement.dto;

import com.projectmanagement.entity.ProjectType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProjectCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Technologies are required")
    private String technologies;

    @NotBlank(message = "Duration is required")
    private String duration;

    @NotNull(message = "Project type is required")
    private ProjectType projectType;

    @NotEmpty(message = "At least one student must be assigned")
    private List<Long> studentIds;

    @NotNull(message = "Team lead student ID is required")
    private Long teamLeadId;
}
