package com.projectmanagement.repository;

import com.projectmanagement.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    
    @Query("SELECT w FROM Workflow w WHERE w.project.id = :projectId")
    Optional<Workflow> findByProjectId(@Param("projectId") Long projectId);
}
