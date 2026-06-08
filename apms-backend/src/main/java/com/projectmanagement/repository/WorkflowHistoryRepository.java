package com.projectmanagement.repository;

import com.projectmanagement.entity.WorkflowHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowHistoryRepository extends JpaRepository<WorkflowHistory, Long> {

    @Query("SELECT h FROM WorkflowHistory h WHERE h.projectId = :projectId ORDER BY h.performedDate DESC")
    List<WorkflowHistory> findHistoryByProject(@Param("projectId") Long projectId);
}
