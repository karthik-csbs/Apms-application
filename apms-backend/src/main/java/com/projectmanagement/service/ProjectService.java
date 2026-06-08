package com.projectmanagement.service;

import com.projectmanagement.dto.ProjectCreateRequestDto;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.dto.StudentProjectResponseDto;
import com.projectmanagement.dto.TeamMemberDto;
import com.projectmanagement.dto.ProjectUpdateDto;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.ProjectTeamRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.repository.WorkflowStageRepository;
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
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final ProjectTeamRepository projectTeamRepository;
    private final WorkflowService workflowService;
    private final WorkflowStageRepository workflowStageRepository;

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequestDto request, Faculty facultyGuide) {
        System.out.println("[INFO] Project creation: Faculty Guide ID " + facultyGuide.getId() + " is creating a project.");
        System.out.println("[DEBUG APMS] createProject() - Faculty: " + facultyGuide.getEmail() + ", Payload: " + request);

        // 1. Team lead must belong to selected team members
        if (!request.getStudentIds().contains(request.getTeamLeadId())) {
            throw new IllegalArgumentException("Team lead must be one of the assigned team members.");
        }

        // 2. Duplicate team assignment not allowed
        long uniqueCount = request.getStudentIds().stream().distinct().count();
        if (uniqueCount != request.getStudentIds().size()) {
            throw new IllegalArgumentException("Duplicate student assignments are not allowed.");
        }

        // 3. Students must belong to logged-in faculty
        List<User> students = new java.util.ArrayList<>();
        for (Long studentId : request.getStudentIds()) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
            
            if (student.getFaculty() == null || !student.getFaculty().getId().equals(facultyGuide.getId())) {
                throw new com.projectmanagement.exception.UnauthorizedException("Student with ID " + studentId + " does not belong to you.");
            }

            students.add(student);
        }

        Project project = new Project();
        project.setTitle(null);
        project.setDescription(null);
        project.setTechnologies(null);
        project.setDuration(request.getDuration());
        project.setProjectType(request.getProjectType());
        project.setStatus(ProjectStatus.ACTIVE);
        project.setFacultyGuide(facultyGuide);
        project.setDepartment(facultyGuide.getDepartment());
        
        // Load Team Lead
        User teamLead = studentRepository.findById(request.getTeamLeadId())
                .orElseThrow(() -> new ResourceNotFoundException("Team Lead student not found with ID: " + request.getTeamLeadId()));
        System.out.println("[INFO] Team lead assignment: Student ID " + request.getTeamLeadId() + " assigned as TEAM_LEAD.");
        project.setTeamLead(teamLead);
        project.setAssignedStudents(students);

        project = projectRepository.save(project);
        System.out.println("[INFO] Project created successfully. Project ID: " + project.getId());

        // Save ProjectTeam mappings
        for (User studentUser : students) {
            if (studentUser instanceof Student) {
                ProjectTeam teamMember = new ProjectTeam();
                teamMember.setProject(project);
                teamMember.setStudent((Student) studentUser);
                boolean isLead = studentUser.getId().equals(request.getTeamLeadId());
                teamMember.setRole(isLead ? TeamRole.TEAM_LEAD : TeamRole.MEMBER);
                projectTeamRepository.save(teamMember);
            }
        }

        // Send notifications with safety try-catch
        for (User student : students) {
            try {
                boolean isLead = student.getId().equals(request.getTeamLeadId());
                if (student instanceof Student) {
                    if (isLead) {
                        notificationService.sendNotification((Student) student, project, "You are selected as Team Lead", 
                                "You are selected as Team Lead");
                    } else {
                        notificationService.sendNotification((Student) student, project, "You are added to project team", 
                                "You are added to project team");
                    }
                }
            } catch (Exception e) {
                System.err.println("[DEBUG APMS] Failed to send notification: " + e.getMessage());
            }
        }

        // Create workflow automatically
        workflowService.createWorkflow(project);

        return mapToResponse(project);
    }

    public ProjectResponse getProjectById(Long projectId, User loggedInUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (loggedInUser.getRole() == Role.FACULTY) {
            if (project.getFacultyGuide() == null || !project.getFacultyGuide().getId().equals(loggedInUser.getId())) {
                throw new com.projectmanagement.exception.UnauthorizedException("Access denied: You are not the guide for this project.");
            }
        } else if (loggedInUser.getRole() == Role.STUDENT) {
            boolean isAssigned = projectTeamRepository.findByProjectIdAndStudentId(projectId, loggedInUser.getId()).isPresent();
            if (!isAssigned) {
                throw new com.projectmanagement.exception.UnauthorizedException("Access denied: You are not assigned to this project.");
            }
        }

        return mapToResponse(project);
    }

    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable).map(this::mapToResponse);
    }

    public List<ProjectResponse> getProjectsByFaculty(Long facultyId) {
        System.out.println("[INFO] Faculty project fetch: Faculty ID " + facultyId + " fetching projects.");
        List<Project> projects = projectRepository.findFacultyProjects(facultyId);
        if (projects == null) {
            return java.util.Collections.emptyList();
        }
        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> getProjectsByStudent(Long studentId) {
        return projectRepository.findProjectsByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StudentProjectResponseDto> getStudentProjects(Long studentId) {
        System.out.println("[INFO] Student dashboard projects fetch: Student ID " + studentId + " fetching dashboard projects.");
        List<ProjectTeam> teamMappings = projectTeamRepository.findByStudentId(studentId);
        if (teamMappings == null || teamMappings.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<Project> projects = teamMappings.stream()
                .map(ProjectTeam::getProject)
                .collect(Collectors.toList());
        if (projects == null) {
            return java.util.Collections.emptyList();
        }
        return projects.stream()
                .map(this::mapToStudentProjectResponseDto)
                .collect(Collectors.toList());
    }

    private StudentProjectResponseDto mapToStudentProjectResponseDto(Project project) {
        List<TeamMemberDto> teamMembers = new java.util.ArrayList<>();
        List<ProjectTeam> teamList = projectTeamRepository.findByProjectId(project.getId());
        if (teamList != null && !teamList.isEmpty()) {
            for (ProjectTeam pt : teamList) {
                teamMembers.add(new TeamMemberDto(
                        pt.getStudent().getId(),
                        pt.getStudent().getName(),
                        pt.getRole() != null ? pt.getRole().name() : "MEMBER",
                        pt.getContribution()
                ));
            }
        } else if (project.getAssignedStudents() != null) {
            for (User student : project.getAssignedStudents()) {
                boolean isLead = project.getTeamLead() != null && student.getId().equals(project.getTeamLead().getId());
                teamMembers.add(new TeamMemberDto(
                        student.getId(),
                        student.getName(),
                        isLead ? "TEAM_LEAD" : "MEMBER",
                        null
                ));
            }
        }

        List<String> techList = project.getTechnologies() != null && !project.getTechnologies().trim().isEmpty()
                ? java.util.Arrays.stream(project.getTechnologies().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList())
                : java.util.Collections.emptyList();

        return new StudentProjectResponseDto(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                techList,
                project.getDuration(),
                project.getStatus(),
                project.getProjectType(),
                project.getFacultyGuide() != null ? project.getFacultyGuide().getName() : null,
                project.getCompletionStatus(),
                teamMembers
        );
    }

    public boolean isTeamLead(Long projectId, Long studentId) {
        return projectTeamRepository.existsByProjectIdAndStudentIdAndRole(projectId, studentId, TeamRole.TEAM_LEAD);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectUpdateDto request, User loggedInUser) {
        System.out.println("[DEBUG APMS] updateProject() - ProjectId: " + projectId + ", User: " + loggedInUser.getEmail());
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        if (loggedInUser.getRole() == Role.FACULTY) {
            if (project.getFacultyGuide() == null || !project.getFacultyGuide().getId().equals(loggedInUser.getId())) {
                throw new com.projectmanagement.exception.UnauthorizedException("Access denied: You are not the guide for this project.");
            }
        }

        if (loggedInUser.getRole() == Role.STUDENT) {
            Student student = studentRepository.findByEmail(loggedInUser.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + loggedInUser.getEmail()));
            boolean isLead = projectTeamRepository.existsByProjectIdAndStudentIdAndRole(
                    projectId,
                    student.getId(),
                    TeamRole.TEAM_LEAD
            );
            if (!isLead) {
                throw new com.projectmanagement.exception.UnauthorizedException("Access denied: Only the Team Lead can edit project details.");
            }
            if (request.getTitle() != null) {
                project.setTitle(request.getTitle());
            }
            if (request.getDescription() != null) {
                project.setDescription(request.getDescription());
            }
            if (request.getTechnologies() != null) {
                project.setTechnologies(String.join(",", request.getTechnologies()));
            }
            if (request.getDuration() != null) {
                project.setDuration(request.getDuration());
            }
            if (request.getGithubUrl() != null) {
                project.setGithubUrl(request.getGithubUrl());
            }
            if (request.getDriveUrl() != null) {
                project.setDriveUrl(request.getDriveUrl());
            }
            if (request.getDocumentUrl() != null) {
                project.setDocumentUrl(request.getDocumentUrl());
            }
        } else {
            if (request.getTitle() != null) {
                project.setTitle(request.getTitle());
            }
            if (request.getDescription() != null) {
                project.setDescription(request.getDescription());
            }
            if (request.getTechnologies() != null) {
                project.setTechnologies(String.join(",", request.getTechnologies()));
            }
            if (request.getDuration() != null) {
                project.setDuration(request.getDuration());
            }
            if (request.getProjectType() != null) {
                project.setProjectType(request.getProjectType());
            }
            if (request.getGithubUrl() != null) {
                project.setGithubUrl(request.getGithubUrl());
            }
            if (request.getDriveUrl() != null) {
                project.setDriveUrl(request.getDriveUrl());
            }
            if (request.getDocumentUrl() != null) {
                project.setDocumentUrl(request.getDocumentUrl());
            }
        }

        project = projectRepository.save(project);
        return mapToResponse(project);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getMyActiveProject(Long studentId) {
        List<ProjectTeam> teams = projectTeamRepository.findByStudentId(studentId);
        if (teams.isEmpty()) {
            throw new ResourceNotFoundException("No project found for student ID: " + studentId);
        }
        Project activeProject = teams.stream()
                .map(ProjectTeam::getProject)
                .filter(p -> p.getStatus() != ProjectStatus.COMPLETED)
                .findFirst()
                .orElseGet(() -> teams.get(0).getProject());
        return mapToResponse(activeProject);
    }

    @Transactional
    public void updateContribution(Long projectId, Long studentId, String contribution) {
        System.out.println("[DEBUG APMS] updateContribution() - ProjectId: " + projectId + ", StudentId: " + studentId + " -> " + contribution);
        ProjectTeam teamMember = projectTeamRepository.findByProjectIdAndStudentId(projectId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student is not assigned to this project."));
        teamMember.setContribution(contribution);
        projectTeamRepository.save(teamMember);
    }

    private ProjectResponse mapToResponse(Project project) {
        List<ProjectResponse.ProjectTeamMemberResponse> teamMembers = new java.util.ArrayList<>();
        List<ProjectTeam> teamList = projectTeamRepository.findByProjectId(project.getId());
        if (teamList != null && !teamList.isEmpty()) {
            for (ProjectTeam pt : teamList) {
                String regNum = pt.getStudent().getRegisterNumber();
                teamMembers.add(new ProjectResponse.ProjectTeamMemberResponse(
                        pt.getStudent().getId(),
                        pt.getStudent().getName(),
                        regNum,
                        pt.isTeamLead(),
                        pt.getRole() != null ? pt.getRole().name() : "MEMBER",
                        pt.getContribution()
                ));
            }
        } else if (project.getAssignedStudents() != null) {
            for (User student : project.getAssignedStudents()) {
                boolean isLead = project.getTeamLead() != null && student.getId().equals(project.getTeamLead().getId());
                String regNum = "";
                if (student instanceof Student) {
                    regNum = ((Student) student).getRegisterNumber();
                }
                teamMembers.add(new ProjectResponse.ProjectTeamMemberResponse(
                        student.getId(),
                        student.getName(),
                        regNum,
                        isLead,
                        isLead ? "TEAM_LEAD" : "MEMBER",
                        null
                ));
            }
        }

        List<String> techList = project.getTechnologies() != null && !project.getTechnologies().trim().isEmpty()
                ? java.util.Arrays.stream(project.getTechnologies().split(","))
                    .map(String::trim)
                    .collect(Collectors.toList())
                : java.util.Collections.emptyList();

        Integer currentStage = null;
        String workflowStatus = null;
        String currentStageStatus = null;

        if (project.getWorkflow() != null) {
            Workflow w = project.getWorkflow();
            currentStage = w.getCurrentStage();
            workflowStatus = w.getWorkflowStatus() != null ? w.getWorkflowStatus().name() : null;
            if (currentStage != null) {
                var stageOpt = workflowStageRepository.findByWorkflowIdAndStageNumber(w.getId(), currentStage);
                if (stageOpt.isPresent()) {
                    currentStageStatus = stageOpt.get().getStageStatus() != null ? stageOpt.get().getStageStatus().name() : null;
                }
            }
        }

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                techList,
                project.getDuration(),
                project.getStatus(),
                project.getProjectType(),
                project.getCompletionStatus(),
                project.getGithubUrl(),
                project.getDriveUrl(),
                project.getDocumentUrl(),
                project.getDepartment() != null ? project.getDepartment().getName() : null,
                project.getFacultyGuide() != null ? project.getFacultyGuide().getName() : null,
                project.getCreatedAt(),
                teamMembers,
                currentStage,
                workflowStatus,
                currentStageStatus
        );
    }
}
