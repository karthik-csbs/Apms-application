package com.projectmanagement.config;

import com.projectmanagement.entity.*;
import com.projectmanagement.repository.DepartmentRepository;
import com.projectmanagement.repository.FacultyRepository;
import com.projectmanagement.repository.StudentRepository;
import com.projectmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.projectmanagement.repository.MeetingRepository meetingRepository;

    @Override
    @Transactional
    public void run(String... args) {
        meetingRepository.deleteMeetingsWithNullFaculty();

        if (userRepository.count() > 0) {
            // Ensure existing students are associated with the seeded faculty guide
            facultyRepository.findByEmail("faculty@pec.edu.in").ifPresent(faculty -> {
                if (!faculty.isEnabled()) {
                    faculty.setEnabled(true);
                    facultyRepository.save(faculty);
                    System.out.println("Enabled seeded faculty user.");
                }
                studentRepository.findAll().forEach(student -> {
                    if (student.getFaculty() == null) {
                        student.setFaculty(faculty);
                        studentRepository.save(student);
                        System.out.println("Associated student " + student.getName() + " with faculty guide.");
                    }
                });
            });
            return;
        }

        // ADMIN
        User admin = new User();
        admin.setName("System Admin");
        admin.setEmail("admin@pec.edu.in");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);

        // PRINCIPAL
        User principal = new User();
        principal.setName("College Principal");
        principal.setEmail("principal@pec.edu.in");
        principal.setPassword(passwordEncoder.encode("Principal@123"));
        principal.setRole(Role.PRINCIPAL);

        userRepository.save(principal);

        // DEPARTMENT
        Department cseDept = new Department();
        cseDept.setName("Computer Science and Engineering");
        cseDept.setCode("CSE");

        cseDept = departmentRepository.save(cseDept);

        // HOD
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

        // FACULTY
        Faculty faculty = new Faculty();
        faculty.setName("Prof. Faculty Name");
        faculty.setEmail("faculty@pec.edu.in");
        faculty.setPassword(passwordEncoder.encode("Faculty@123"));
        faculty.setRole(Role.FACULTY);
        faculty.setEnabled(true);
        faculty.setDesignation("Assistant Professor");
        faculty.setDepartment(cseDept);

        facultyRepository.save(faculty);

        // STUDENTS
        Student student1 = new Student();
        student1.setName("Arjun Sharma");
        student1.setEmail("student@pec.edu.in");
        student1.setPassword(passwordEncoder.encode("Student@123"));
        student1.setRole(Role.STUDENT);
        student1.setRegisterNumber("111420104001");
        student1.setDepartment(cseDept);
        student1.setFaculty(faculty);
        studentRepository.save(student1);

        Student student2 = new Student();
        student2.setName("Priya Patel");
        student2.setEmail("student2@pec.edu.in");
        student2.setPassword(passwordEncoder.encode("Student@123"));
        student2.setRole(Role.STUDENT);
        student2.setRegisterNumber("111420104002");
        student2.setDepartment(cseDept);
        student2.setFaculty(faculty);
        studentRepository.save(student2);

        Student student3 = new Student();
        student3.setName("Rohan Das");
        student3.setEmail("student3@pec.edu.in");
        student3.setPassword(passwordEncoder.encode("Student@123"));
        student3.setRole(Role.STUDENT);
        student3.setRegisterNumber("111420104003");
        student3.setDepartment(cseDept);
        student3.setFaculty(faculty);
        studentRepository.save(student3);

        System.out.println("Database seeded successfully.");
    }
}