package com.projectmanagement;

import com.projectmanagement.report.controller.ReportController;
import com.projectmanagement.report.dto.ProjectReportDto;
import com.projectmanagement.report.dto.ReportRequestDto;
import com.projectmanagement.report.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class ReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController)
                .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void testGetProjectReport_Success() throws Exception {
        ProjectReportDto dto = new ProjectReportDto();
        dto.setProjectId(1L);
        dto.setProjectTitle("Test Title");

        when(reportService.generateProjectReport(any(ReportRequestDto.class), any())).thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/reports/project")
                .param("projectType", "MAIN")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].projectTitle").value("Test Title"));
    }
}
