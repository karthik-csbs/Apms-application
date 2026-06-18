package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.dto.StudentProfileResponse;
import com.projectmanagement.entity.Student;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {

    private final ProjectService projectService;
    private final StudentRepository studentRepository;

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Object>> getFacultyProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal User user) {
        if (page == null || size == null) {
            List<ProjectResponse> projects = projectService.getProjectsByFaculty(user.getId());
            return ResponseEntity.ok(new ApiResponse<>(true, "Faculty projects fetched successfully", projects));
        }
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                sortDir.equalsIgnoreCase("asc") ? org.springframework.data.domain.Sort.Direction.ASC : org.springframework.data.domain.Sort.Direction.DESC,
                sortBy
        );
        com.projectmanagement.dto.PageResponse<ProjectResponse> projects = projectService.getFacultyProjectsPaginated(user.getId(), search, org.springframework.data.domain.PageRequest.of(page, size, sort));
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty projects fetched successfully", projects));
    }

    // Delegated to FacultyStudentController to avoid ambiguous mapping


    @PostMapping("/student/{id}/send-credentials")
    public ResponseEntity<ApiResponse<Void>> sendCredentials(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        System.out.println("Simulating mail delivery for student " + id + 
                           " | Email: " + payload.get("email") + 
                           " | Name: " + payload.get("name") + 
                           " | Password: " + payload.get("password"));
        return ResponseEntity.ok(new ApiResponse<>(true, "Credentials sent successfully (simulated)", null));
    }
}
