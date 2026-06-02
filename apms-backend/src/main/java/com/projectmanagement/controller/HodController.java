package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.entity.Faculty;
import com.projectmanagement.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hod")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOD')")
public class HodController {

    private final FacultyRepository facultyRepository;

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<FacultyResponseDto>>> getDepartmentFaculty() {
        // Retrieve all faculties (can filter by department if department mapping is set up)
        List<Faculty> faculties = facultyRepository.findAll();
        List<FacultyResponseDto> response = faculties.stream()
                .map(f -> new FacultyResponseDto(
                        f.getId(),
                        f.getName(),
                        f.getEmail(),
                        f.getDesignation()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Faculty list fetched successfully", response));
    }

    @lombok.Value
    public static class FacultyResponseDto {
        Long id;
        String name;
        String email;
        String designation;
    }
}
