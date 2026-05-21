package com.projectmanagement.service.impl;

import com.projectmanagement.dto.RegisterRequestDto;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.EmailAlreadyExistsException;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.DepartmentRepository;
import com.projectmanagement.repository.UserRepository;
import com.projectmanagement.service.RegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationServiceImpl implements RegistrationService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public User registerFaculty(RegisterRequestDto request) {
        validateEmail(request.getEmail());
        
        Faculty faculty = new Faculty();
        setupBaseUser(faculty, request, Role.FACULTY);
        faculty.setDesignation(request.getDesignation());
        
        if (request.getDepartmentId() != null) {
            faculty.setDepartment(getDepartment(request.getDepartmentId()));
        }

        return userRepository.save(faculty);
    }

    @Override
    @Transactional
    public User registerHod(RegisterRequestDto request) {
        validateEmail(request.getEmail());
        
        User hod = new User();
        setupBaseUser(hod, request, Role.HOD);
        
        return userRepository.save(hod);
    }

    @Override
    @Transactional
    public User registerPrincipal(RegisterRequestDto request) {
        validateEmail(request.getEmail());
        
        User principal = new User();
        setupBaseUser(principal, request, Role.PRINCIPAL);
        
        return userRepository.save(principal);
    }

    @Override
    @Transactional
    public User registerStudent(RegisterRequestDto request) {
        validateEmail(request.getEmail());
        
        Student student = new Student();
        setupBaseUser(student, request, Role.STUDENT);
        student.setRegisterNumber(request.getRegisterNumber());
        
        if (request.getDepartmentId() != null) {
            student.setDepartment(getDepartment(request.getDepartmentId()));
        }

        return userRepository.save(student);
    }

    private void validateEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already registered: " + email);
        }
    }

    private Department getDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
    }

    private void setupBaseUser(User user, RegisterRequestDto request, Role role) {
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
    }
}
