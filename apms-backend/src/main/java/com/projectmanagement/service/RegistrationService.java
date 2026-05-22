package com.projectmanagement.service;

import com.projectmanagement.dto.FacultyRegisterRequestDto;
import com.projectmanagement.dto.HodRegisterRequestDto;
import com.projectmanagement.dto.PrincipalRegisterRequestDto;
import com.projectmanagement.dto.StudentRegisterRequestDto;
import com.projectmanagement.entity.User;

public interface RegistrationService {
    User registerFaculty(FacultyRegisterRequestDto request);
    User registerHod(HodRegisterRequestDto request);
    User registerPrincipal(PrincipalRegisterRequestDto request);
    User registerStudent(StudentRegisterRequestDto request);
}
