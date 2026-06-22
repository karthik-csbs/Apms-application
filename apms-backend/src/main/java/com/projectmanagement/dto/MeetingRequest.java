package com.projectmanagement.dto;

import com.projectmanagement.entity.MeetingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRequest {
    private String title;
    private String description;
    private MeetingType meetingType;
    private LocalDate meetingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String meetingLink;
    
    // Optional depending on Meeting Type
    private Long projectId;
    private Long departmentId;
    
    // Explicitly selected participant user IDs (for student, faculty meetings)
    private List<Long> participantIds;
}
