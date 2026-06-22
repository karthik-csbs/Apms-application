package com.projectmanagement.service;

import com.projectmanagement.dto.*;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingParticipantRepository meetingParticipantRepository;
    private final ProjectRepository projectRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public MeetingResponse createMeeting(MeetingRequest request, User currentUser) {
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setMeetingType(request.getMeetingType());
        meeting.setMeetingDate(request.getMeetingDate());
        meeting.setStartTime(request.getStartTime());
        meeting.setEndTime(request.getEndTime());
        meeting.setLocation(request.getLocation());
        meeting.setMeetingLink(request.getMeetingLink());
        meeting.setCreatedBy(currentUser);
        meeting.setStatus(MeetingStatus.SCHEDULED);

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            meeting.setProject(project);
            meeting.setDepartment(project.getDepartment());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            meeting.setDepartment(department);
        }

        meeting = meetingRepository.save(meeting);

        // Resolve and Create Participants
        List<MeetingParticipant> participants = resolveParticipants(meeting, request, currentUser);
        meetingParticipantRepository.saveAll(participants);
        meeting.setParticipants(participants);

        // Send notifications
        sendNotificationsToParticipants(meeting);

        // Log Audit
        auditLogService.log("MEETING_CREATE", "Created meeting: " + meeting.getTitle() + " with type " + meeting.getMeetingType(), currentUser);

        return convertToResponse(meeting);
    }

    @Transactional(readOnly = true)
    public PageResponse<MeetingResponse> getMyMeetings(
            User currentUser,
            int page,
            int size,
            String search,
            String sortBy,
            String sortDir
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        // Resolve HOD department if current user is HOD, Faculty department if Faculty, Student department if Student
        Long deptId = null;
        if (currentUser.getRole() == Role.HOD) {
            Faculty fac = facultyRepository.findByEmail(currentUser.getEmail()).orElse(null);
            if (fac != null && fac.getDepartment() != null) {
                deptId = fac.getDepartment().getId();
            }
        }

        Page<Meeting> meetings = meetingRepository.findMyMeetings(
                currentUser.getId(),
                currentUser.getRole().name(),
                deptId,
                search == null || search.trim().isEmpty() ? null : search,
                pageable
        );

        return PageResponse.from(meetings, this::convertToResponse);
    }

    @Transactional
    public MeetingResponse cancelMeeting(Long id, User currentUser) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));

        meeting.setStatus(MeetingStatus.CANCELLED);
        meeting = meetingRepository.save(meeting);

        // Notify participants of cancellation
        for (MeetingParticipant p : meeting.getParticipants()) {
            Student student = studentRepository.findByEmail(p.getUser().getEmail()).orElse(null);
            if (student != null) {
                notificationService.sendNotification(
                        student,
                        meeting.getProject(),
                        "Meeting Cancelled",
                        "The meeting '" + meeting.getTitle() + "' scheduled on " + meeting.getMeetingDate() + " has been cancelled."
                );
            }
        }

        auditLogService.log("MEETING_CANCEL", "Cancelled meeting: " + meeting.getTitle(), currentUser);

        return convertToResponse(meeting);
    }

    @Transactional(readOnly = true)
    public List<MeetingParticipantResponse> previewProjectParticipants(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        List<MeetingParticipantResponse> preview = new ArrayList<>();

        // 1. Faculty Guide
        if (project.getFacultyGuide() != null) {
            preview.add(MeetingParticipantResponse.builder()
                    .userId(project.getFacultyGuide().getId())
                    .name(project.getFacultyGuide().getName())
                    .email(project.getFacultyGuide().getEmail())
                    .role("Faculty Guide")
                    .participantRole(MeetingParticipantRole.GUIDE)
                    .build());
        }

        // 2. Team Lead
        if (project.getTeamLead() != null) {
            preview.add(MeetingParticipantResponse.builder()
                    .userId(project.getTeamLead().getId())
                    .name(project.getTeamLead().getName())
                    .email(project.getTeamLead().getEmail())
                    .role("Team Lead")
                    .participantRole(MeetingParticipantRole.ORGANIZER)
                    .build());
        }

        // 3. Team Members
        if (project.getTeamMembers() != null) {
            for (ProjectTeam member : project.getTeamMembers()) {
                if (member.getStudent() != null) {
                    preview.add(MeetingParticipantResponse.builder()
                            .userId(member.getStudent().getId())
                            .name(member.getStudent().getName())
                            .email(member.getStudent().getEmail())
                            .role("Team Member")
                            .participantRole(MeetingParticipantRole.STUDENT)
                            .build());
                }
            }
        }

        // Remove duplicate user entries
        Set<MeetingParticipantResponse> uniqueSet = new LinkedHashSet<>(preview);
        return new ArrayList<>(uniqueSet);
    }

    private List<MeetingParticipant> resolveParticipants(Meeting meeting, MeetingRequest request, User organizer) {
        Set<User> uniqueUsers = new LinkedHashSet<>();
        Map<Long, MeetingParticipantRole> roleMap = new HashMap<>();

        // Add organizer
        uniqueUsers.add(organizer);
        roleMap.put(organizer.getId(), MeetingParticipantRole.ORGANIZER);

        switch (meeting.getMeetingType()) {
            case PROJECT_MEETING:
                if (meeting.getProject() != null) {
                    Project p = meeting.getProject();
                    if (p.getFacultyGuide() != null) {
                        uniqueUsers.add(p.getFacultyGuide());
                        roleMap.put(p.getFacultyGuide().getId(), MeetingParticipantRole.GUIDE);
                    }
                    if (p.getTeamLead() != null) {
                        uniqueUsers.add(p.getTeamLead());
                        roleMap.put(p.getTeamLead().getId(), MeetingParticipantRole.ORGANIZER);
                    }
                    if (p.getTeamMembers() != null) {
                        for (ProjectTeam m : p.getTeamMembers()) {
                            if (m.getStudent() != null) {
                                uniqueUsers.add(m.getStudent());
                                roleMap.put(m.getStudent().getId(), MeetingParticipantRole.STUDENT);
                            }
                        }
                    }
                    // Reviewers
                    if (p.getWorkflow() != null) {
                        // Gather reviewers from stage
                        // We do a lookup or query since stage reviewers are long IDs
                    }
                }
                break;

            case STUDENT_MEETING:
                if (request.getParticipantIds() != null) {
                    List<User> students = userRepository.findAllById(request.getParticipantIds());
                    for (User s : students) {
                        uniqueUsers.add(s);
                        roleMap.put(s.getId(), MeetingParticipantRole.STUDENT);
                    }
                }
                break;

            case FACULTY_MEETING:
                if (request.getParticipantIds() != null) {
                    List<User> faculty = userRepository.findAllById(request.getParticipantIds());
                    for (User f : faculty) {
                        uniqueUsers.add(f);
                        roleMap.put(f.getId(), MeetingParticipantRole.FACULTY);
                    }
                }
                break;

            case REVIEW_MEETING:
                if (meeting.getProject() != null) {
                    Project p = meeting.getProject();
                    if (p.getFacultyGuide() != null) {
                        uniqueUsers.add(p.getFacultyGuide());
                        roleMap.put(p.getFacultyGuide().getId(), MeetingParticipantRole.GUIDE);
                    }
                    if (p.getTeamLead() != null) {
                        uniqueUsers.add(p.getTeamLead());
                        roleMap.put(p.getTeamLead().getId(), MeetingParticipantRole.STUDENT);
                    }
                    if (p.getTeamMembers() != null) {
                        for (ProjectTeam m : p.getTeamMembers()) {
                            if (m.getStudent() != null) {
                                uniqueUsers.add(m.getStudent());
                                roleMap.put(m.getStudent().getId(), MeetingParticipantRole.STUDENT);
                            }
                        }
                    }
                }
                if (request.getParticipantIds() != null) {
                    List<User> reviewers = userRepository.findAllById(request.getParticipantIds());
                    for (User r : reviewers) {
                        uniqueUsers.add(r);
                        roleMap.put(r.getId(), MeetingParticipantRole.REVIEWER);
                    }
                }
                break;

            case DEPARTMENT_MEETING:
                if (meeting.getDepartment() != null) {
                    // Fetch students and faculty belonging to department
                    List<Student> students = studentRepository.findByDepartmentId(meeting.getDepartment().getId());
                    List<Faculty> faculties = facultyRepository.findByDepartmentId(meeting.getDepartment().getId());
                    for (Student s : students) {
                        uniqueUsers.add(s);
                        roleMap.put(s.getId(), MeetingParticipantRole.STUDENT);
                    }
                    for (Faculty f : faculties) {
                        uniqueUsers.add(f);
                        roleMap.put(f.getId(), MeetingParticipantRole.FACULTY);
                    }
                }
                break;
        }

        List<MeetingParticipant> participants = new ArrayList<>();
        for (User u : uniqueUsers) {
            MeetingParticipant mp = new MeetingParticipant();
            mp.setMeeting(meeting);
            mp.setUser(u);
            mp.setParticipantRole(roleMap.getOrDefault(u.getId(), MeetingParticipantRole.STUDENT));
            mp.setAttendanceStatus(AttendanceStatus.PENDING);
            participants.add(mp);
        }

        return participants;
    }

    private void sendNotificationsToParticipants(Meeting meeting) {
        for (MeetingParticipant p : meeting.getParticipants()) {
            Student student = studentRepository.findByEmail(p.getUser().getEmail()).orElse(null);
            if (student != null) {
                notificationService.sendNotification(
                        student,
                        meeting.getProject(),
                        "New Meeting Scheduled",
                        "A new " + meeting.getMeetingType() + " '" + meeting.getTitle() + "' is scheduled on " + meeting.getMeetingDate() + " at " + meeting.getStartTime()
                );
            }
        }
    }

    private MeetingResponse convertToResponse(Meeting meeting) {
        List<MeetingParticipantResponse> participantResponses = Collections.emptyList();
        if (meeting.getParticipants() != null) {
            participantResponses = meeting.getParticipants().stream()
                    .map(p -> MeetingParticipantResponse.builder()
                            .id(p.getId())
                            .userId(p.getUser().getId())
                            .name(p.getUser().getName())
                            .email(p.getUser().getEmail())
                            .role(p.getUser().getRole().name())
                            .participantRole(p.getParticipantRole())
                            .attendanceStatus(p.getAttendanceStatus())
                            .build())
                    .collect(Collectors.toList());
        }

        return MeetingResponse.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .meetingType(meeting.getMeetingType())
                .meetingDate(meeting.getMeetingDate())
                .startTime(meeting.getStartTime())
                .endTime(meeting.getEndTime())
                .location(meeting.getLocation())
                .meetingLink(meeting.getMeetingLink())
                .status(meeting.getStatus())
                .projectId(meeting.getProject() != null ? meeting.getProject().getId() : null)
                .projectTitle(meeting.getProject() != null ? meeting.getProject().getTitle() : null)
                .departmentId(meeting.getDepartment() != null ? meeting.getDepartment().getId() : null)
                .departmentName(meeting.getDepartment() != null ? meeting.getDepartment().getName() : null)
                .createdById(meeting.getCreatedBy().getId())
                .createdByName(meeting.getCreatedBy().getName())
                .participants(participantResponses)
                .build();
    }
}