package com.projectmanagement.service;

import com.projectmanagement.dto.ProjectCreateRequest;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.ProjectTeamRepository;
import com.projectmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, Faculty facultyGuide) {
        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setTechnologies(request.getTechnologies());
        project.setDuration(request.getDuration());
        project.setProjectType(request.getProjectType());
        project.setStatus(ProjectStatus.PENDING);
        project.setFacultyGuide(facultyGuide);
        project.setDepartment(facultyGuide.getDepartment());
        
        project = projectRepository.save(project);

        for (Long studentId : request.getStudentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

            ProjectTeam teamMember = new ProjectTeam();
            teamMember.setProject(project);
            teamMember.setStudent(student);
            teamMember.setTeamLead(student.getId().equals(request.getTeamLeadId()));
            projectTeamRepository.save(teamMember);
        }

        return getProjectById(project.getId());
    }

    public ProjectResponse getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
        return mapToResponse(project);
    }

    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::mapToResponse);
    }

    public Page<ProjectResponse> getProjectsByFaculty(Long facultyId, Pageable pageable) {
        // Implementation would need a custom repository method findByFacultyGuideId
        return Page.empty(); // Placeholder
    }

    private ProjectResponse mapToResponse(Project project) {
        List<ProjectTeam> team = projectTeamRepository.findAll().stream()
                .filter(pt -> pt.getProject().getId().equals(project.getId()))
                .collect(Collectors.toList());

        List<ProjectResponse.ProjectTeamMemberResponse> teamMembers = team.stream()
                .map(pt -> new ProjectResponse.ProjectTeamMemberResponse(
                        pt.getStudent().getId(),
                        pt.getStudent().getName(),
                        pt.getStudent().getRegisterNumber(),
                        pt.isTeamLead()
                ))
                .collect(Collectors.toList());

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getTechnologies(),
                project.getDuration(),
                project.getStatus(),
                project.getProjectType(),
                project.getCompletionStatus(),
                project.getDepartment().getName(),
                project.getFacultyGuide().getName(),
                project.getCreatedAt(),
                teamMembers
        );
    }
}
