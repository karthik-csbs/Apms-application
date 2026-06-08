package com.projectmanagement.controller;

import com.projectmanagement.dto.ApiResponse;
import com.projectmanagement.dto.WorkflowResponse;
import com.projectmanagement.dto.WorkflowSubmitRequest;
import com.projectmanagement.dto.WorkflowReviewRequest;
import com.projectmanagement.dto.WorkflowApproveRequest;
import com.projectmanagement.dto.WorkflowRejectRequest;
import com.projectmanagement.dto.WorkflowHistoryResponse;
import com.projectmanagement.dto.WorkflowStageResponse;
import com.projectmanagement.service.WorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
@Tag(name = "Project Workflow", description = "Endpoints for project approval workflows")
public class WorkflowController {

    private final WorkflowService workflowService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit workflow stage for review")
    public ResponseEntity<ApiResponse<WorkflowResponse>> submitWorkflow(
            @Valid @RequestBody WorkflowSubmitRequest request) {
        WorkflowResponse response = workflowService.submitWorkflow(request.getProjectId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Workflow stage submitted successfully", response));
    }

    @PostMapping("/review")
    @PreAuthorize("hasRole('FACULTY')")
    @Operation(summary = "Review workflow stage")
    public ResponseEntity<ApiResponse<WorkflowResponse>> reviewWorkflow(
            @Valid @RequestBody WorkflowReviewRequest request) {
        WorkflowResponse response = workflowService.reviewWorkflow(request.getProjectId(), request.getRemarks());
        return ResponseEntity.ok(new ApiResponse<>(true, "Workflow stage reviewed successfully", response));
    }

    @PostMapping("/approve")
    @PreAuthorize("hasAnyRole('HOD', 'PRINCIPAL')")
    @Operation(summary = "Approve workflow stage")
    public ResponseEntity<ApiResponse<WorkflowResponse>> approveWorkflow(
            @Valid @RequestBody WorkflowApproveRequest request) {
        WorkflowResponse response = workflowService.approveWorkflow(request.getProjectId(), request.getRemarks());
        return ResponseEntity.ok(new ApiResponse<>(true, "Workflow stage approved successfully", response));
    }

    @PostMapping("/reject")
    @PreAuthorize("hasAnyRole('FACULTY', 'HOD', 'PRINCIPAL')")
    @Operation(summary = "Reject workflow stage")
    public ResponseEntity<ApiResponse<WorkflowResponse>> rejectWorkflow(
            @Valid @RequestBody WorkflowRejectRequest request) {
        WorkflowResponse response = workflowService.rejectWorkflow(request.getProjectId(), request.getRemarks());
        return ResponseEntity.ok(new ApiResponse<>(true, "Workflow stage rejected successfully", response));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY', 'STUDENT')")
    @Operation(summary = "Get project workflow status")
    public ResponseEntity<ApiResponse<WorkflowResponse>> getWorkflow(
            @PathVariable Long projectId) {
        WorkflowResponse response = workflowService.getWorkflow(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Workflow status fetched successfully", response));
    }

    @GetMapping("/history/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY', 'STUDENT')")
    @Operation(summary = "Get project workflow history")
    public ResponseEntity<ApiResponse<List<WorkflowHistoryResponse>>> getWorkflowHistory(
            @PathVariable Long projectId) {
        List<WorkflowHistoryResponse> response = workflowService.getWorkflowHistory(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Workflow history fetched successfully", response));
    }

    @GetMapping("/stage/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD', 'PRINCIPAL', 'FACULTY', 'STUDENT')")
    @Operation(summary = "Get current active stage status")
    public ResponseEntity<ApiResponse<WorkflowStageResponse>> getCurrentStage(
            @PathVariable Long projectId) {
        WorkflowStageResponse response = workflowService.getCurrentStage(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Current active stage status fetched successfully", response));
    }
}
