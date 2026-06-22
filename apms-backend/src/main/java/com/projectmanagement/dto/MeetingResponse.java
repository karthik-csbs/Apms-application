package com.projectmanagement.dto;

import com.projectmanagement.entity.MeetingStatus;
import com.projectmanagement.entity.MeetingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingResponse {
    private Long id;
    private String title;
    private String description;
    private MeetingType meetingType;
    private LocalDate meetingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String location;
    private String meetingLink;
    private MeetingStatus status;
    
    private Long projectId;
    private String projectTitle;
    
    private Long departmentId;
    private String departmentName;
    
    private Long createdById;
    private String createdByName;
    
    private List<MeetingParticipantResponse> participants;
}
