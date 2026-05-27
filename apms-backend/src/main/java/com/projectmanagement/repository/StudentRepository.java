package com.projectmanagement.repository;

import com.projectmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    @Query("SELECT DISTINCT s FROM Project p JOIN p.assignedStudents s WHERE p.facultyGuide.id = :facultyId")
    List<Student> findStudentsByFacultyGuideId(@Param("facultyId") Long facultyId);

    java.util.Optional<Student> findByEmail(String email);
    List<Student> findByRole(com.projectmanagement.entity.Role role);
    List<Student> findByFacultyId(Long facultyId);
}

