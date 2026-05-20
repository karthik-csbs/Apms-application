package com.projectmanagement.config;

import com.projectmanagement.entity.Department;
import com.projectmanagement.entity.Faculty;
import com.projectmanagement.entity.Role;
import com.projectmanagement.entity.Student;
import com.projectmanagement.entity.User;
import com.projectmanagement.repository.DepartmentRepository;
import com.projectmanagement.repository.FacultyRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// @Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // 1. Create Admin
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@pec.edu.in");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            // 2. Create Principal
            User principal = new User();
            principal.setName("College Principal");
            principal.setEmail("principal@pec.edu.in");
            principal.setPassword(passwordEncoder.encode("Principal@123"));
            principal.setRole(Role.PRINCIPAL);
            userRepository.save(principal);

            // 3. Create Department
            Department cseDept = new Department();
            cseDept.setName("Computer Science and Engineering");
            cseDept.setCode("CSE");
            cseDept = departmentRepository.save(cseDept);

            // 4. Create HOD (First as a user, then assign to dept or create Faculty)
            Faculty hod = new Faculty();
            hod.setName("Dr. HOD Name");
            hod.setEmail("hod.cse@pec.edu.in");
            hod.setPassword(passwordEncoder.encode("Hod@123"));
            hod.setRole(Role.HOD);
            hod.setDesignation("Professor and Head");
            hod.setDepartment(cseDept);
            hod = facultyRepository.save(hod);
            
            cseDept.setHod(hod);
            departmentRepository.save(cseDept);

            // 5. Create Faculty
            Faculty faculty = new Faculty();
            faculty.setName("Prof. Faculty Name");
            faculty.setEmail("faculty@pec.edu.in");
            faculty.setPassword(passwordEncoder.encode("Faculty@123"));
            faculty.setRole(Role.FACULTY);
            faculty.setDesignation("Assistant Professor");
            faculty.setDepartment(cseDept);
            facultyRepository.save(faculty);

            // 6. Create Student
            Student student = new Student();
            student.setName("Student Name");
            student.setEmail("student@pec.edu.in");
            student.setPassword(passwordEncoder.encode("Student@123"));
            student.setRole(Role.STUDENT);
            student.setRegisterNumber("111420104001");
            student.setDepartment(cseDept);
            studentRepository.save(student);

            System.out.println("Database seeded successfully with default accounts.");
        }
    }
}
