package com.projectmanagement.repository;

import com.projectmanagement.entity.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, Long> {

    @Query("SELECT ws FROM WorkflowStage ws WHERE ws.workflow.id = :workflowId ORDER BY ws.stageNumber ASC")
    List<WorkflowStage> findByWorkflowId(@Param("workflowId") Long workflowId);

    @Query("SELECT ws FROM WorkflowStage ws WHERE ws.workflow.id = :workflowId AND ws.stageNumber = :stageNumber")
    Optional<WorkflowStage> findByWorkflowIdAndStageNumber(@Param("workflowId") Long workflowId, @Param("stageNumber") Integer stageNumber);
}
