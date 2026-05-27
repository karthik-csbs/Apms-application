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
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getFacultyProjects(@AuthenticationPrincipal User user) {
        List<ProjectResponse> projects = projectService.getProjectsByFaculty(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty projects fetched successfully", projects));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentProfileResponse>>> getFacultyStudents(@AuthenticationPrincipal User user) {
        List<Student> students = studentRepository.findByFacultyId(user.getId());
        List<StudentProfileResponse> response = students.stream()
                .map(student -> new StudentProfileResponse(
                        student.getId(),
                        student.getName(),
                        student.getEmail(),
                        student.getRegisterNumber(),
                        student.getDepartment() != null ? student.getDepartment().getName() : null,
                        student.getDepartment() != null ? student.getDepartment().getId() : null,
                        student.getMobile(),
                        student.getSkills(),
                        student.getGithubProfile(),
                        student.getLinkedinUrl(),
                        student.getResumeUrl(),
                        student.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty students fetched successfully", response));
    }

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
