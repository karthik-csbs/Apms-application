package com.projectmanagement.dto;

import com.projectmanagement.entity.AttendanceStatus;
import com.projectmanagement.entity.MeetingParticipantRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingParticipantResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private MeetingParticipantRole participantRole;
    private AttendanceStatus attendanceStatus;
}
