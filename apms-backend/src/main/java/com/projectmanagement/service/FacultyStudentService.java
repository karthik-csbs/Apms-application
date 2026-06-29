package com.projectmanagement.service;

import com.projectmanagement.dto.FacultyStudentCreateDto;
import com.projectmanagement.dto.FacultyStudentDto;
import com.projectmanagement.dto.FacultyStudentResponseDto;
import com.projectmanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FacultyStudentService {
    FacultyStudentResponseDto createStudent(FacultyStudentCreateDto request, User creator);
    Page<FacultyStudentDto> getStudents(String search, Pageable pageable, User user);
    java.util.List<FacultyStudentDto> getStudentsList(String search, User user);
    FacultyStudentDto getStudentById(Long id, User user);
    FacultyStudentDto updateStudent(Long id, FacultyStudentCreateDto request, User user);
    void deactivateStudent(Long id, User user);
    String resetPassword(Long id, User user);
    FacultyStudentResponseDto resendCredentials(Long id, User user);
}
