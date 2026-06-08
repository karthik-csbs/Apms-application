package com.projectmanagement.entity;

import com.projectmanagement.audit.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_history")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowHistory extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "stage_number")
    private Integer stageNumber;

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "new_status")
    private String newStatus;

    private String action;

    private String remarks;

    @Column(name = "performed_by")
    private String performedBy;

    @Column(name = "performed_date")
    private LocalDateTime performedDate;
}
