package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.ProjectUpdateDto;
import com.projectmanagement.dto.ProjectCreateRequestDto;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.dto.SubmissionRequest;
import com.projectmanagement.entity.Faculty;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.FacultyRepository;
import com.projectmanagement.service.ProjectService;
import com.projectmanagement.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final SubmissionService submissionService;
    private final FacultyRepository facultyRepository;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequestDto request,
            @AuthenticationPrincipal User user) {

        Faculty facultyGuide = facultyRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        ProjectResponse createdProject = projectService.createProject(request, facultyGuide);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project created successfully", createdProject));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        ProjectResponse project = projectService.getProjectById(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project fetched successfully", project));
    }

    @GetMapping("/my-project")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ProjectResponse>> getMyProject(
            @AuthenticationPrincipal User user) {
        ProjectResponse project = projectService.getMyActiveProject(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Active project fetched successfully", project));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD')")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(Pageable pageable) {
        Page<ProjectResponse> projects = projectService.getAllProjects(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Projects fetched successfully", projects));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable("id") Long id,
            @RequestBody ProjectUpdateDto request,
            @AuthenticationPrincipal User user) {
        ProjectResponse updated = projectService.updateProject(id, request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project updated successfully", updated));
    }

    @PutMapping("/team-lead/{projectId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateTeamLeadProject(
            @PathVariable("projectId") Long projectId,
            @RequestBody ProjectUpdateDto request,
            @AuthenticationPrincipal User user) {
        ProjectResponse updated = projectService.updateProject(projectId, request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project updated successfully", updated));
    }

    @PostMapping("/request-completion/{projectId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> requestCompletion(
            @PathVariable Long projectId,
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal User user) {
        submissionService.createSubmission(projectId, user.getId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project completion request submitted", null));
    }

    @PutMapping("/approve/{projectId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> approveCompletion(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User user) {
        submissionService.approveCompletionRequest(projectId, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project completion approved", null));
    }

    @PutMapping("/reject/{projectId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> rejectCompletion(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        String remarks = payload.getOrDefault("remarks", "");
        submissionService.rejectCompletionRequest(projectId, remarks, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project completion rejected", null));
    }

    @PutMapping("/{projectId}/contribution")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> updateContribution(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        String contribution = payload.getOrDefault("contribution", "");
        projectService.updateContribution(projectId, user.getId(), contribution);
        return ResponseEntity.ok(new ApiResponse<>(true, "Contribution updated successfully", null));
    }
}
