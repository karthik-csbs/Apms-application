package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.RegisterRequestDto;
import com.projectmanagement.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/register")
@RequiredArgsConstructor
@Tag(name = "Admin Registration", description = "Endpoints for Admin to register Faculty, HOD, and Principal")
@PreAuthorize("hasRole('ADMIN')")
public class AdminRegistrationController {

    private final RegistrationService registrationService;

    @PostMapping("/faculty")
    @Operation(summary = "Register a new Faculty")
    public ResponseEntity<ApiResponse<Void>> registerFaculty(@Valid @RequestBody RegisterRequestDto request) {
        registrationService.registerFaculty(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty registered successfully", null));
    }

    @PostMapping("/hod")
    @Operation(summary = "Register a new HOD")
    public ResponseEntity<ApiResponse<Void>> registerHod(@Valid @RequestBody RegisterRequestDto request) {
        registrationService.registerHod(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "HOD registered successfully", null));
    }

    @PostMapping("/principal")
    @Operation(summary = "Register a new Principal")
    public ResponseEntity<ApiResponse<Void>> registerPrincipal(@Valid @RequestBody RegisterRequestDto request) {
        registrationService.registerPrincipal(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Principal registered successfully", null));
    }
}
