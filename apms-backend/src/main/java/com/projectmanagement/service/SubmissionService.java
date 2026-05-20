package com.projectmanagement.service;

import com.projectmanagement.entity.Project;
import com.projectmanagement.entity.ProjectStatus;
import com.projectmanagement.entity.Student;
import com.projectmanagement.entity.Submission;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final CertificateService certificateService;

    @Transactional
    public Submission createSubmission(Long projectId, Long studentId, String documentUrl, String githubUrl, String driveUrl) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Submission submission = new Submission();
        submission.setProject(project);
        submission.setStudent(student);
        submission.setDocumentUrl(documentUrl);
        submission.setGithubUrl(githubUrl);
        submission.setDriveUrl(driveUrl);
        
        submission = submissionRepository.save(submission);

        // Update project status to indicate a completion request was raised
        project.setCompletionStatus("PENDING_APPROVAL");
        projectRepository.save(project);

        notificationService.sendNotification(project.getFacultyGuide(),
                "New Project Submission",
                "Student " + student.getName() + " has uploaded a submission for project: " + project.getTitle());

        return submission;
    }

    @Transactional
    public void approveCompletionRequest(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        project.setStatus(ProjectStatus.COMPLETED);
        project.setCompletionStatus("APPROVED");
        projectRepository.save(project);

        // Assuming team leads or all students get certificates
        // Here we just pick the first student for simplicity in this method, but realistically it's handled via teams.
        // certificateService.generateCertificate(project, student);

        notificationService.sendNotification(project.getFacultyGuide(), // Should notify student
                "Project Approved",
                "Project " + project.getTitle() + " has been approved and marked as completed.");
    }
}
