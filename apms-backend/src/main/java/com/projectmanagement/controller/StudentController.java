package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.ProjectResponse;
import com.projectmanagement.dto.StudentProjectResponseDto;
import com.projectmanagement.dto.StudentProfileResponse;
import com.projectmanagement.dto.StudentProfileUpdateRequest;
import com.projectmanagement.entity.Student;
import com.projectmanagement.entity.User;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;
    private final ProjectService projectService;

    @GetMapping("/student/projects")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentProjectResponseDto>>> getStudentProjects(
            @AuthenticationPrincipal User user,
            org.springframework.security.core.Authentication authentication) {
        try {
            Student student = studentRepository.findByEmail(user.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + user.getUsername()));
            
            Long studentId = student.getId();
            
            // Debug requirements
            System.out.println(studentId);
            System.out.println(authentication.getName());

            List<StudentProjectResponseDto> projects = projectService.getStudentProjects(studentId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Student projects fetched successfully", projects));
        } catch (Exception e) {
            System.err.println("Error fetching student projects: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse<>(true, "Student projects fetched successfully (fallback)", java.util.Collections.emptyList()));
        }
    }

    @GetMapping("/student/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getStudentProfile(@AuthenticationPrincipal User user) {
        Student student = studentRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + user.getId()));
        
        StudentProfileResponse response = mapToProfileResponse(student);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student profile fetched successfully", response));
    }

    @PutMapping("/student/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateStudentProfile(
            @Valid @RequestBody StudentProfileUpdateRequest request,
            @AuthenticationPrincipal User user) {
        Student student = studentRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + user.getId()));

        student.setName(request.getName());
        student.setMobile(request.getMobile());
        if (request.getRegisterNumber() != null) {
            student.setRegisterNumber(request.getRegisterNumber());
        }
        student.setSkills(request.getSkills());
        student.setGithubProfile(request.getGithubProfile());
        student.setLinkedinUrl(request.getLinkedinUrl());
        student.setResumeUrl(request.getResumeUrl());

        student = studentRepository.save(student);
        StudentProfileResponse response = mapToProfileResponse(student);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student profile updated successfully", response));
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'HOD', 'PRINCIPAL')")
    public ResponseEntity<ApiResponse<Object>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        if (page == null || size == null) {
            List<Student> students = studentRepository.findAll();
            List<StudentProfileResponse> response = students.stream()
                    .map(this::mapToProfileResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse<>(true, "All students fetched successfully", response));
        }
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                sortDir.equalsIgnoreCase("asc") ? org.springframework.data.domain.Sort.Direction.ASC : org.springframework.data.domain.Sort.Direction.DESC,
                sortBy
        );
        org.springframework.data.domain.Page<Student> studentsPage = studentRepository.findAllPaginated(search, org.springframework.data.domain.PageRequest.of(page, size, sort));
        com.projectmanagement.dto.PageResponse<StudentProfileResponse> response = com.projectmanagement.dto.PageResponse.from(studentsPage, this::mapToProfileResponse);
        return ResponseEntity.ok(new ApiResponse<>(true, "Students fetched successfully", response));
    }

    private StudentProfileResponse mapToProfileResponse(Student student) {
        return new StudentProfileResponse(
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
        );
    }
}
