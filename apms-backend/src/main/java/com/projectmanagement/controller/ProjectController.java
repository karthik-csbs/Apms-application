package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.ProjectCreateRequest;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.entity.Faculty;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.FacultyRepository;
import com.projectmanagement.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final FacultyRepository facultyRepository;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectCreateRequest request,
            @AuthenticationPrincipal User user) {

        Faculty facultyGuide = facultyRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        ProjectResponse createdProject = projectService.createProject(request, facultyGuide);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project created successfully", createdProject));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable Long id) {
        ProjectResponse project = projectService.getProjectById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project fetched successfully", project));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAllProjects(Pageable pageable) {
        Page<ProjectResponse> projects = projectService.getAllProjects(pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Projects fetched successfully", projects));
    }
}
