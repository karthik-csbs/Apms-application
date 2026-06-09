package com.projectmanagement.repository;

import com.projectmanagement.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByFacultyGuideId(Long facultyId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.department LEFT JOIN FETCH p.facultyGuide LEFT JOIN FETCH p.teamLead JOIN p.assignedStudents s WHERE s.id = :studentId")
    List<Project> findProjectsByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN FETCH p.department LEFT JOIN FETCH p.facultyGuide LEFT JOIN FETCH p.teamLead WHERE p.facultyGuide.id = :facultyId")
    List<Project> findProjectsByFacultyId(@Param("facultyId") Long facultyId);

    @Query("""
    SELECT DISTINCT p
    FROM Project p
    LEFT JOIN FETCH p.teamMembers tm
    LEFT JOIN FETCH tm.student
    WHERE p.facultyGuide.id = :facultyId
    """)
    List<Project> findFacultyProjects(@Param("facultyId") Long facultyId);
}

