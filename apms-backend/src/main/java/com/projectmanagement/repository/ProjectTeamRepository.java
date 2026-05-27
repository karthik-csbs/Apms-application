package com.projectmanagement.repository;

import com.projectmanagement.entity.ProjectTeam;
import com.projectmanagement.entity.Student;
import com.projectmanagement.entity.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
    
    @Query("SELECT pt FROM ProjectTeam pt WHERE pt.student.id = :studentId")
    List<ProjectTeam> findByStudentId(@Param("studentId") Long studentId);

    List<ProjectTeam> findByStudent(Student student);
    
    List<ProjectTeam> findByProjectId(Long projectId);
    
    @Query("SELECT pt FROM ProjectTeam pt WHERE pt.project.id = :projectId AND pt.student.id = :studentId")
    Optional<ProjectTeam> findByProjectIdAndStudentId(@Param("projectId") Long projectId, @Param("studentId") Long studentId);
    
    @Query("SELECT COUNT(pt) > 0 FROM ProjectTeam pt WHERE pt.project.id = :projectId AND pt.student.id = :studentId AND pt.role = :role")
    boolean existsByProjectIdAndStudentIdAndRole(@Param("projectId") Long projectId, @Param("studentId") Long studentId, @Param("role") TeamRole role);

    @Query("SELECT COUNT(pt) > 0 FROM ProjectTeam pt WHERE pt.student.id = :studentId AND pt.project.status <> com.projectmanagement.entity.ProjectStatus.COMPLETED")
    boolean existsActiveProjectByStudentId(@Param("studentId") Long studentId);
}
