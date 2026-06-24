package com.projectmanagement.controller;

import com.projectmanagement.dto.*;
import com.projectmanagement.entity.*;
import com.projectmanagement.repository.FacultyRepository;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<MeetingResponse>> createMeeting(
            @RequestBody MeetingRequest request,
            @AuthenticationPrincipal User currentUser) {
        MeetingResponse response = meetingService.createMeeting(request, currentUser);
        return ResponseEntity.ok(new ApiResponse<>(true, "Meeting created and participants notified successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<MeetingResponse>>> getMyMeetings(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "meetingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<MeetingResponse> response = meetingService.getMyMeetings(currentUser, page, size, search, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "My meetings fetched successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<MeetingResponse>>> getAllMeetings(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "meetingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<MeetingResponse> response = meetingService.getMyMeetings(currentUser, page, size, search, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "All meetings fetched successfully", response));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<MeetingResponse>>> getUpcomingMeetings(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "meetingDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PageResponse<MeetingResponse> response = meetingService.getUpcomingMeetings(currentUser, page, size, search, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "Upcoming meetings fetched successfully", response));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<MeetingResponse>>> getHistoryMeetings(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "meetingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<MeetingResponse> response = meetingService.getHistoryMeetings(currentUser, page, size, search, sortBy, sortDir);
        return ResponseEntity.ok(new ApiResponse<>(true, "History meetings fetched successfully", response));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<MeetingResponse>> cancelMeeting(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        MeetingResponse response = meetingService.cancelMeeting(id, currentUser);
        return ResponseEntity.ok(new ApiResponse<>(true, "Meeting cancelled successfully", response));
    }

    @GetMapping("/projects")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getActiveProjects(@AuthenticationPrincipal User currentUser) {
        List<ProjectResponse> projects;
        if (currentUser.getRole() == Role.FACULTY) {
            projects = projectRepository.findAll().stream()
                    .filter(p -> p.getFacultyGuide() != null && p.getFacultyGuide().getId().equals(currentUser.getId()))
                    .map(p -> new ProjectResponse(
                            p.getId(), p.getTitle(), p.getDescription(),
                            p.getTechnologies() != null ? java.util.Arrays.asList(p.getTechnologies().split(",")) : java.util.Collections.emptyList(),
                            p.getDuration(), p.getStatus(), p.getProjectType(), p.getCompletionStatus(),
                            p.getGithubUrl(), p.getDriveUrl(), p.getDocumentUrl(),
                            p.getDepartment() != null ? p.getDepartment().getName() : null,
                            p.getFacultyGuide() != null ? p.getFacultyGuide().getName() : null,
                            p.getCreatedAt(), java.util.Collections.emptyList(), null, null, null
                    ))
                    .collect(Collectors.toList());
        } else {
            projects = projectRepository.findAll().stream()
                    .map(p -> new ProjectResponse(
                            p.getId(), p.getTitle(), p.getDescription(),
                            p.getTechnologies() != null ? java.util.Arrays.asList(p.getTechnologies().split(",")) : java.util.Collections.emptyList(),
                            p.getDuration(), p.getStatus(), p.getProjectType(), p.getCompletionStatus(),
                            p.getGithubUrl(), p.getDriveUrl(), p.getDocumentUrl(),
                            p.getDepartment() != null ? p.getDepartment().getName() : null,
                            p.getFacultyGuide() != null ? p.getFacultyGuide().getName() : null,
                            p.getCreatedAt(), java.util.Collections.emptyList(), null, null, null
                    ))
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Active projects fetched successfully", projects));
    }

    @GetMapping("/project-participants/{projectId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<List<MeetingParticipantResponse>>> previewProjectParticipants(@PathVariable Long projectId) {
        List<MeetingParticipantResponse> preview = meetingService.previewProjectParticipants(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Project participants previewed successfully", preview));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN', 'HOD')")
    public ResponseEntity<ApiResponse<List<MeetingParticipantResponse>>> getUsersForDropdown(
            @RequestParam String type,
            @AuthenticationPrincipal User currentUser) {
        // Return students or faculty
        List<MeetingParticipantResponse> list;
        if ("STUDENT".equalsIgnoreCase(type)) {
            list = studentRepository.findAll().stream()
                    .map(s -> MeetingParticipantResponse.builder()
                            .userId(s.getId())
                            .name(s.getName() + " (" + s.getRegisterNumber() + ")")
                            .email(s.getEmail())
                            .role("STUDENT")
                            .build())
                    .collect(Collectors.toList());
        } else {
            list = facultyRepository.findAll().stream()
                    .map(f -> MeetingParticipantResponse.builder()
                            .userId(f.getId())
                            .name(f.getName() + " (" + f.getDesignation() + ")")
                            .email(f.getEmail())
                            .role("FACULTY")
                            .build())
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Users fetched successfully", list));
    }
}
