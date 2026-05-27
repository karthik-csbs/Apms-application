package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.StudentRegisterRequestDto;
import com.projectmanagement.entity.User;
import com.projectmanagement.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/faculty/register")
@RequiredArgsConstructor
@Tag(name = "Faculty Registration", description = "Endpoints for Faculty to register Students")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyRegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/student")
    @Operation(summary = "Register a new Student")
    public ResponseEntity<ApiResponse<User>> registerStudent(
            @Valid @RequestBody StudentRegisterRequestDto request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal User user) {
        User registered = registrationService.registerStudent(request, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Student registered successfully", registered));
    }
}
