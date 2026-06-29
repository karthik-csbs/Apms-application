package com.projectmanagement.service.impl;

import com.projectmanagement.dto.FacultyStudentCreateDto;
import com.projectmanagement.dto.FacultyStudentDto;
import com.projectmanagement.dto.FacultyStudentResponseDto;
import com.projectmanagement.entity.*;
import com.projectmanagement.exception.EmailAlreadyExistsException;
import com.projectmanagement.exception.ResourceNotFoundException;
import com.projectmanagement.repository.FacultyRepository;
import com.projectmanagement.repository.ProjectRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.repository.UserRepository;
import com.projectmanagement.service.FacultyStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyStudentServiceImpl implements FacultyStudentService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;
    private final com.projectmanagement.notification.service.EmailService emailService;

    @Override
    @Transactional
    public FacultyStudentResponseDto createStudent(FacultyStudentCreateDto request, User creator) {
        validateEmail(request.getEmail(), null);
        validateRegisterNumber(request.getRegisterNumber(), null);

        Department dept = entityManager.find(Department.class, request.getDepartmentId());
        if (dept == null) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        // Determine creator faculty
        Faculty facultyCreator = null;
        if (creator != null) {
            if (creator.getRole() == Role.FACULTY) {
                facultyCreator = facultyRepository.findByEmail(creator.getEmail()).orElse(null);
            } else if (creator.getRole() == Role.HOD) {
                // HOD can register department students
                facultyCreator = facultyRepository.findByEmail(creator.getEmail()).orElse(null);
                if (facultyCreator != null && !facultyCreator.getDepartment().getId().equals(dept.getId())) {
                    throw new AccessDeniedException("HOD can only manage students in their department");
                }
            }
        }

        String rawPassword = generateSecurePassword();

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(rawPassword));
        student.setRole(Role.STUDENT);
        student.setRegisterNumber(request.getRegisterNumber());
        student.setMobile(request.getMobile());
        student.setDepartment(dept);
        student.setFaculty(facultyCreator);
        student.setEnabled(true);

        student = userRepository.save(student);

        // Assign to project if provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            project.getAssignedStudents().add(student);
            projectRepository.save(project);
        }

        boolean emailSent = false;
        try {
            emailService.sendCredentialEmail(student.getName(), student.getEmail(), student.getEmail(), rawPassword);
            student.setEmailDeliveryStatus("SUCCESS");
            emailSent = true;
        } catch (Exception e) {
            student.setEmailDeliveryStatus("FAILED");
        }
        student.setLastCredentialEmailSent(java.time.LocalDateTime.now());
        userRepository.save(student);

        return FacultyStudentResponseDto.builder()
                .studentId(student.getId())
                .username(student.getEmail())
                .temporaryPassword(rawPassword)
                .emailSent(emailSent)
                .studentEmail(student.getEmail())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FacultyStudentDto> getStudents(String search, Pageable pageable, User user) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Student s LEFT JOIN FETCH s.department LEFT JOIN FETCH s.faculty WHERE 1=1");
        StringBuilder countJpql = new StringBuilder("SELECT COUNT(s) FROM Student s WHERE 1=1");

        List<String> conditions = new ArrayList<>();
        
        // Role restrictions
        if (user.getRole() == Role.FACULTY) {
            conditions.add("(s.faculty.email = :facultyEmail OR s.id IN (SELECT stud.id FROM Project p JOIN p.assignedStudents stud WHERE p.facultyGuide.email = :facultyEmail))");
        } else if (user.getRole() == Role.HOD) {
            Faculty hodFaculty = facultyRepository.findByEmail(user.getEmail()).orElse(null);
            if (hodFaculty != null && hodFaculty.getDepartment() != null) {
                conditions.add("s.department.id = :deptId");
            } else {
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }

        // Search restriction
        if (search != null && !search.trim().isEmpty()) {
            conditions.add("(LOWER(s.name) LIKE LOWER(:search) OR LOWER(s.email) LIKE LOWER(:search) OR LOWER(s.registerNumber) LIKE LOWER(:search))");
        }

        for (String cond : conditions) {
            jpql.append(" AND ").append(cond);
            countJpql.append(" AND ").append(cond);
        }

        if (pageable.getSort().isSorted()) {
            jpql.append(" ORDER BY ");
            String sortedFields = pageable.getSort().stream()
                    .map(order -> "s." + order.getProperty() + " " + order.getDirection().name())
                    .collect(Collectors.joining(", "));
            jpql.append(sortedFields);
        } else {
            jpql.append(" ORDER BY s.id DESC");
        }

        TypedQuery<Student> query = entityManager.createQuery(jpql.toString(), Student.class);
        TypedQuery<Long> countQuery = entityManager.createQuery(countJpql.toString(), Long.class);

        // Parameters
        if (user.getRole() == Role.FACULTY) {
            query.setParameter("facultyEmail", user.getEmail());
            countQuery.setParameter("facultyEmail", user.getEmail());
        } else if (user.getRole() == Role.HOD) {
            Faculty hodFaculty = facultyRepository.findByEmail(user.getEmail()).orElse(null);
            query.setParameter("deptId", hodFaculty.getDepartment().getId());
            countQuery.setParameter("deptId", hodFaculty.getDepartment().getId());
        }

        if (search != null && !search.trim().isEmpty()) {
            query.setParameter("search", "%" + search.trim() + "%");
            countQuery.setParameter("search", "%" + search.trim() + "%");
        }

        long total = countQuery.getSingleResult();

        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<Student> students = query.getResultList();

        List<FacultyStudentDto> dtos = students.stream().map(st -> {
            // Find project
            List<Project> projects = projectRepository.findProjectsByStudentId(st.getId());
            Project proj = projects.isEmpty() ? null : projects.get(0);

            return FacultyStudentDto.builder()
                    .id(st.getId())
                    .name(st.getName())
                    .email(st.getEmail())
                    .registerNumber(st.getRegisterNumber())
                    .mobile(st.getMobile())
                    .departmentId(st.getDepartment() != null ? st.getDepartment().getId() : null)
                    .departmentName(st.getDepartment() != null ? st.getDepartment().getName() : null)
                    .projectId(proj != null ? proj.getId() : null)
                    .projectTitle(proj != null ? proj.getTitle() : null)
                    .enabled(st.isEnabled())
                    .createdAt(st.getCreatedAt())
                    .lastCredentialEmailSent(st.getLastCredentialEmailSent())
                    .emailDeliveryStatus(st.getEmailDeliveryStatus())
                    .build();
        }).collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyStudentDto> getStudentsList(String search, User user) {
        StringBuilder jpql = new StringBuilder("SELECT s FROM Student s LEFT JOIN FETCH s.department LEFT JOIN FETCH s.faculty WHERE 1=1");
        List<String> conditions = new ArrayList<>();
        
        if (user.getRole() == Role.FACULTY) {
            conditions.add("(s.faculty.email = :facultyEmail OR s.id IN (SELECT stud.id FROM Project p JOIN p.assignedStudents stud WHERE p.facultyGuide.email = :facultyEmail))");
        } else if (user.getRole() == Role.HOD) {
            Faculty hodFaculty = facultyRepository.findByEmail(user.getEmail()).orElse(null);
            if (hodFaculty != null && hodFaculty.getDepartment() != null) {
                conditions.add("s.department.id = :deptId");
            } else {
                return Collections.emptyList();
            }
        }

        if (search != null && !search.trim().isEmpty()) {
            conditions.add("(LOWER(s.name) LIKE LOWER(:search) OR LOWER(s.email) LIKE LOWER(:search) OR LOWER(s.registerNumber) LIKE LOWER(:search))");
        }

        for (String cond : conditions) {
            jpql.append(" AND ").append(cond);
        }
        jpql.append(" ORDER BY s.id DESC");

        TypedQuery<Student> query = entityManager.createQuery(jpql.toString(), Student.class);

        if (user.getRole() == Role.FACULTY) {
            query.setParameter("facultyEmail", user.getEmail());
        } else if (user.getRole() == Role.HOD) {
            Faculty hodFaculty = facultyRepository.findByEmail(user.getEmail()).orElse(null);
            query.setParameter("deptId", hodFaculty.getDepartment().getId());
        }

        if (search != null && !search.trim().isEmpty()) {
            query.setParameter("search", "%" + search.trim() + "%");
        }

        List<Student> students = query.getResultList();
        return students.stream().map(st -> {
            List<Project> projects = projectRepository.findProjectsByStudentId(st.getId());
            Project proj = projects.isEmpty() ? null : projects.get(0);

            return FacultyStudentDto.builder()
                    .id(st.getId())
                    .name(st.getName())
                    .email(st.getEmail())
                    .registerNumber(st.getRegisterNumber())
                    .mobile(st.getMobile())
                    .departmentId(st.getDepartment() != null ? st.getDepartment().getId() : null)
                    .departmentName(st.getDepartment() != null ? st.getDepartment().getName() : null)
                    .projectId(proj != null ? proj.getId() : null)
                    .projectTitle(proj != null ? proj.getTitle() : null)
                    .enabled(st.isEnabled())
                    .createdAt(st.getCreatedAt())
                    .lastCredentialEmailSent(st.getLastCredentialEmailSent())
                    .emailDeliveryStatus(st.getEmailDeliveryStatus())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyStudentDto getStudentById(Long id, User user) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        validateAccess(student, user);

        List<Project> projects = projectRepository.findProjectsByStudentId(student.getId());
        Project proj = projects.isEmpty() ? null : projects.get(0);

        return FacultyStudentDto.builder()
                .id(student.getId())
                .name(student.getName())
                .email(student.getEmail())
                .registerNumber(student.getRegisterNumber())
                .mobile(student.getMobile())
                .departmentId(student.getDepartment() != null ? student.getDepartment().getId() : null)
                .departmentName(student.getDepartment() != null ? student.getDepartment().getName() : null)
                .projectId(proj != null ? proj.getId() : null)
                .projectTitle(proj != null ? proj.getTitle() : null)
                .enabled(student.isEnabled())
                .createdAt(student.getCreatedAt())
                .lastCredentialEmailSent(student.getLastCredentialEmailSent())
                .emailDeliveryStatus(student.getEmailDeliveryStatus())
                .build();
    }

    @Override
    @Transactional
    public FacultyStudentDto updateStudent(Long id, FacultyStudentCreateDto request, User user) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        validateAccess(student, user);
        validateEmail(request.getEmail(), id);
        validateRegisterNumber(request.getRegisterNumber(), id);

        Department dept = entityManager.find(Department.class, request.getDepartmentId());
        if (dept == null) {
            throw new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId());
        }

        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setRegisterNumber(request.getRegisterNumber());
        student.setMobile(request.getMobile());
        student.setDepartment(dept);

        student = studentRepository.save(student);

        // Update project assignment
        List<Project> currentProjects = projectRepository.findProjectsByStudentId(student.getId());
        for (Project cp : currentProjects) {
            cp.getAssignedStudents().remove(student);
            projectRepository.save(cp);
        }

        Project proj = null;
        if (request.getProjectId() != null) {
            proj = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            proj.getAssignedStudents().add(student);
            projectRepository.save(proj);
        }

        return FacultyStudentDto.builder()
                .id(student.getId())
                .name(student.getName())
                .email(student.getEmail())
                .registerNumber(student.getRegisterNumber())
                .mobile(student.getMobile())
                .departmentId(student.getDepartment() != null ? student.getDepartment().getId() : null)
                .departmentName(student.getDepartment() != null ? student.getDepartment().getName() : null)
                .projectId(proj != null ? proj.getId() : null)
                .projectTitle(proj != null ? proj.getTitle() : null)
                .enabled(student.isEnabled())
                .createdAt(student.getCreatedAt())
                .lastCredentialEmailSent(student.getLastCredentialEmailSent())
                .emailDeliveryStatus(student.getEmailDeliveryStatus())
                .build();
    }

    @Override
    @Transactional
    public void deactivateStudent(Long id, User user) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        validateAccess(student, user);
        student.setEnabled(false);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public String resetPassword(Long id, User user) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        validateAccess(student, user);

        String newPassword = generateSecurePassword();
        student.setPassword(passwordEncoder.encode(newPassword));
        studentRepository.save(student);

        return newPassword;
    }

    private void validateAccess(Student student, User user) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (user.getRole() == Role.HOD) {
            Faculty hodFaculty = facultyRepository.findByEmail(user.getEmail()).orElse(null);
            if (hodFaculty != null && hodFaculty.getDepartment() != null 
                && student.getDepartment() != null 
                && hodFaculty.getDepartment().getId().equals(student.getDepartment().getId())) {
                return;
            }
            throw new AccessDeniedException("HOD can only manage students in their department");
        }

        if (user.getRole() == Role.FACULTY) {
            // Must be creator or guide of the student's project
            boolean isCreator = student.getFaculty() != null && student.getFaculty().getEmail().equals(user.getEmail());
            boolean isGuide = false;
            List<Project> studentProjects = projectRepository.findProjectsByStudentId(student.getId());
            for (Project p : studentProjects) {
                if (p.getFacultyGuide() != null && p.getFacultyGuide().getEmail().equals(user.getEmail())) {
                    isGuide = true;
                    break;
                }
            }
            if (isCreator || isGuide) {
                return;
            }
            throw new AccessDeniedException("Faculty can only manage their assigned students");
        }

        throw new AccessDeniedException("Operation not permitted for role " + user.getRole());
    }

    private void validateEmail(String email, Long excludeId) {
        String jpql = "SELECT COUNT(u) FROM User u WHERE u.email = :email";
        if (excludeId != null) {
            jpql += " AND u.id != :excludeId";
        }
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("email", email);
        if (excludeId != null) {
            query.setParameter("excludeId", excludeId);
        }
        if (query.getSingleResult() > 0) {
            throw new EmailAlreadyExistsException("Email is already registered: " + email);
        }
    }

    private void validateRegisterNumber(String registerNumber, Long excludeId) {
        String jpql = "SELECT COUNT(s) FROM Student s WHERE s.registerNumber = :regNum";
        if (excludeId != null) {
            jpql += " AND s.id != :excludeId";
        }
        TypedQuery<Long> query = entityManager.createQuery(jpql, Long.class)
                .setParameter("regNum", registerNumber);
        if (excludeId != null) {
            query.setParameter("excludeId", excludeId);
        }
        if (query.getSingleResult() > 0) {
            throw new IllegalArgumentException("Register Number is already in use: " + registerNumber);
        }
    }

    private String generateSecurePassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%&*";
        String all = upper + lower + digits + special;
        SecureRandom rand = new SecureRandom();
        
        StringBuilder pw = new StringBuilder();
        pw.append(upper.charAt(rand.nextInt(upper.length())));
        pw.append(lower.charAt(rand.nextInt(lower.length())));
        pw.append(digits.charAt(rand.nextInt(digits.length())));
        pw.append(special.charAt(rand.nextInt(special.length())));
        
        for (int i = 4; i < 12; i++) {
            pw.append(all.charAt(rand.nextInt(all.length())));
        }
        
        List<Character> chars = pw.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());
        Collections.shuffle(chars);
        
        StringBuilder result = new StringBuilder();
        for (char c : chars) {
            result.append(c);
        }
        return result.toString();
    }

    @Override
    @Transactional
    public FacultyStudentResponseDto resendCredentials(Long id, User user) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        validateAccess(student, user);

        String newPassword = generateSecurePassword();
        student.setPassword(passwordEncoder.encode(newPassword));

        boolean emailSent = false;
        try {
            emailService.sendCredentialEmail(student.getName(), student.getEmail(), student.getEmail(), newPassword);
            student.setEmailDeliveryStatus("SUCCESS");
            emailSent = true;
        } catch (Exception e) {
            student.setEmailDeliveryStatus("FAILED");
        }
        student.setLastCredentialEmailSent(java.time.LocalDateTime.now());
        userRepository.save(student);

        return FacultyStudentResponseDto.builder()
                .studentId(student.getId())
                .username(student.getEmail())
                .temporaryPassword(newPassword)
                .emailSent(emailSent)
                .studentEmail(student.getEmail())
                .build();
    }
}
