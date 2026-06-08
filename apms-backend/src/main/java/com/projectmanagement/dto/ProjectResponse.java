package com.projectmanagement.dto;

import com.projectmanagement.entity.ProjectStatus;
import com.projectmanagement.entity.ProjectType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private List<String> technologies;
    private String duration;
    private ProjectStatus status;
    private ProjectType projectType;
    private String completionStatus;
    private String githubUrl;
    private String driveUrl;
    private String documentUrl;
    private String departmentName;
    private String facultyGuideName;
    private LocalDateTime createdAt;
    private List<ProjectTeamMemberResponse> teamMembers;
    private Integer currentStage;
    private String workflowStatus;
    private String currentStageStatus;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectTeamMemberResponse {
        private Long studentId;
        private String studentName;
        private String registerNumber;
        private boolean isTeamLead;
        private String role;
        private String contribution;
    }
}
