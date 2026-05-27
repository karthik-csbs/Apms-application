package com.projectmanagement.dto;

import lombok.Data;
import java.util.List;
import com.projectmanagement.entity.ProjectType;

@Data
public class ProjectUpdateDto {
    private String title;
    private String description;
    private List<String> technologies;
    private String duration;
    private ProjectType projectType;
    private String githubUrl;
    private String driveUrl;
    private String documentUrl;
}
