package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.FacultyStudentCreateDto;
import com.projectmanagement.dto.FacultyStudentDto;
import com.projectmanagement.dto.FacultyStudentResponseDto;
import com.projectmanagement.entity.User;
import com.projectmanagement.service.FacultyStudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faculty/students")
@RequiredArgsConstructor
@Tag(name = "Faculty Student Management", description = "Endpoints for Faculty to manage student accounts")
@PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'ADMIN')")
public class FacultyStudentController {

    private final FacultyStudentService facultyStudentService;

    @PostMapping
    @Operation(summary = "Create a new Student account")
    public ResponseEntity<ApiResponse<FacultyStudentResponseDto>> createStudent(
            @Valid @RequestBody FacultyStudentCreateDto request,
            @AuthenticationPrincipal User creator) {
        FacultyStudentResponseDto response = facultyStudentService.createStudent(request, creator);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student account created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get list of Students with pagination and search filtering")
    public ResponseEntity<ApiResponse<Object>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @AuthenticationPrincipal User user) {
        if (page == null || size == null) {
            java.util.List<FacultyStudentDto> list = facultyStudentService.getStudentsList(search, user);
            return ResponseEntity.ok(new ApiResponse<>(true, "Students list fetched successfully", list));
        }
        Page<FacultyStudentDto> students = facultyStudentService.getStudents(search, PageRequest.of(page, size), user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Students list fetched successfully", students));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Student profile by ID")
    public ResponseEntity<ApiResponse<FacultyStudentDto>> getStudentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        FacultyStudentDto student = facultyStudentService.getStudentById(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student profile fetched successfully", student));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Student profile details")
    public ResponseEntity<ApiResponse<FacultyStudentDto>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody FacultyStudentCreateDto request,
            @AuthenticationPrincipal User user) {
        FacultyStudentDto updated = facultyStudentService.updateStudent(id, request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student profile updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate Student account")
    public ResponseEntity<ApiResponse<String>> deactivateStudent(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        facultyStudentService.deactivateStudent(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student account deactivated successfully", "Account deactivated"));
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset Student account password and return temporary one")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        String temporaryPassword = facultyStudentService.resetPassword(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", temporaryPassword));
    }
}
