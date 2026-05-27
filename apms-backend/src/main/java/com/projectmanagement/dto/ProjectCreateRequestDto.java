package com.projectmanagement.dto;

import com.projectmanagement.entity.ProjectType;
import lombok.Data;
import java.util.List;

@Data
public class ProjectCreateRequestDto {
    private String duration;
    private ProjectType projectType;
    private List<Long> studentIds;
    private Long teamLeadId;
}
