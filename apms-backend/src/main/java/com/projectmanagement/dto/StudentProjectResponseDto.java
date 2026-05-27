package com.projectmanagement.dto;

import com.projectmanagement.entity.ProjectStatus;
import com.projectmanagement.entity.ProjectType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProjectResponseDto {
    private Long id;
    private String title;
    private String description;
    private List<String> technologies;
    private String duration;
    private ProjectStatus status;
    private ProjectType projectType;
    private String facultyGuideName;
    private String completionStatus;
    private List<TeamMemberDto> teamMembers;
}
