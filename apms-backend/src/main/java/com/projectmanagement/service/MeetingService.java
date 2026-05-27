package com.projectmanagement.service;

import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.MeetingRepository;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    @Transactional
    public Meeting requestMeeting(Long projectId, Long studentId, String agenda) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Meeting meeting = new Meeting();
        meeting.setProject(project);
        meeting.setFaculty((Faculty) project.getFacultyGuide());
        meeting.setStudent(student);
        meeting.setAgenda(agenda);
        meeting.setStatus(MeetingStatus.REQUESTED);

        meeting = meetingRepository.save(meeting);

        // Notification to Student
        notificationService.sendNotification(
                student,
                project,
                "Meeting Request Sent",
                "Your meeting request has been sent to faculty for project: "
                        + project.getTitle()
        );

        return meeting;
    }

    @Transactional
    public Meeting scheduleMeeting(Long meetingId, LocalDateTime scheduledTime) {

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));

        meeting.setScheduledAt(scheduledTime);
        meeting.setStatus(MeetingStatus.SCHEDULED);

        meeting = meetingRepository.save(meeting);

        notificationService.sendNotification(
                meeting.getStudent(),
                meeting.getProject(),
                "Meeting Scheduled",
                "Your meeting for project "
                        + meeting.getProject().getTitle()
                        + " has been scheduled at "
                        + scheduledTime
        );

        return meeting;
    }
}