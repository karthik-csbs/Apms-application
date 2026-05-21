package com.projectmanagement.service;

import com.projectmanagement.dto.RegisterRequestDto;
import com.projectmanagement.entity.User;

public interface RegistrationService {
    User registerFaculty(RegisterRequestDto request);
    User registerHod(RegisterRequestDto request);
    User registerPrincipal(RegisterRequestDto request);
    User registerStudent(RegisterRequestDto request);
}
