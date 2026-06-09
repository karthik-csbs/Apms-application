package com.projectmanagement.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReportDto {
    private Long reviewId;
    private String projectName;
    private String reviewer;
    private String stage;
    private LocalDateTime reviewDate;
    private String score; // Set to "N/A" or dynamic value
    private String comments;
    private String status;
}
