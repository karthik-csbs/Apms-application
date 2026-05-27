package com.projectmanagement.service;

import com.projectmanagement.dto.SubmissionRequest;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final CertificateService certificateService;

    @Transactional
    public Submission createSubmission(Long projectId, Long studentId, SubmissionRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Validate student is assigned to the project
        boolean isAssigned = project.getAssignedStudents().stream().anyMatch(s -> s.getId().equals(studentId));
        if (!isAssigned) {
            throw new com.projectmanagement.exception.UnauthorizedException("Access denied: You are not a member of this project.");
        }

        // Validate student is the TEAM_LEAD of the project
        boolean isLead = project.getTeamLead() != null && project.getTeamLead().getId().equals(studentId);
        if (!isLead) {
            throw new com.projectmanagement.exception.UnauthorizedException("Access denied: Only the Team Lead can submit deliverables.");
        }

        Submission submission = new Submission();
        submission.setProject(project);
        submission.setStudent(student);
        submission.setDocumentUrl(request.getDocumentUrl());
        submission.setGithubUrl(request.getGithubUrl());
        submission.setDriveUrl(request.getDriveUrl());
        
        submission = submissionRepository.save(submission);

        // Update project status to indicate a completion request was raised
        project.setCompletionStatus("PENDING_APPROVAL");
        project.setDocumentUrl(request.getDocumentUrl());
        project.setGithubUrl(request.getGithubUrl());
        project.setDriveUrl(request.getDriveUrl());
        projectRepository.save(project);

        // Notify all team members
        for (User member : project.getAssignedStudents()) {
            try {
                if (member instanceof Student) {
                    notificationService.sendNotification(
                            (Student) member,
                            project,
                            "Completion Request Submitted",
                            "Team Lead " + student.getName() + " has submitted completion deliverables for project: " + project.getTitle()
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }

        return submission;
    }

    @Transactional
    public void approveCompletionRequest(Long projectId, User loggedInUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Verify guide ownership
        if (!project.getFacultyGuide().getId().equals(loggedInUser.getId()) && loggedInUser.getRole() != Role.ADMIN) {
            throw new com.projectmanagement.exception.UnauthorizedException("Access denied: You are not the guide for this project.");
        }

        project.setStatus(ProjectStatus.COMPLETED);
        project.setCompletionStatus("APPROVED");
        projectRepository.save(project);

        // Generate certificates and notifications for all team members
        for (User member : project.getAssignedStudents()) {
            try {
                if (member instanceof Student) {
                    Student s = (Student) member;
                    certificateService.generateCertificate(project, s);
                    notificationService.sendNotification(
                            s,
                            project,
                            "Project Completion Approved",
                            "Project \"" + project.getTitle() + "\" has been approved by Faculty Guide. Your certificate has been generated!"
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to process certificate/notification: " + e.getMessage());
            }
        }
    }

    @Transactional
    public void rejectCompletionRequest(Long projectId, String remarks, User loggedInUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Verify guide ownership
        if (!project.getFacultyGuide().getId().equals(loggedInUser.getId()) && loggedInUser.getRole() != Role.ADMIN) {
            throw new com.projectmanagement.exception.UnauthorizedException("Access denied: You are not the guide for this project.");
        }

        project.setCompletionStatus("REJECTED");
        projectRepository.save(project);

        // Save remarks in the latest submission
        Submission submission = submissionRepository.findFirstByProjectIdOrderBySubmittedAtDesc(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No submission found for this project"));
        submission.setRemarks(remarks);
        submissionRepository.save(submission);

        // Notify all team members
        for (User member : project.getAssignedStudents()) {
            try {
                if (member instanceof Student) {
                    Student s = (Student) member;
                    notificationService.sendNotification(
                            s,
                            project,
                            "Project Completion Rejected",
                            "Project \"" + project.getTitle() + "\" submission has been rejected. Reason: " + remarks
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }
    }
}
