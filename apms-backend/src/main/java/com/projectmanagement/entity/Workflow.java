package com.projectmanagement.entity;

import com.projectmanagement.audit.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Workflow extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "project_type")
    private ProjectType projectType;

    @Column(name = "total_stages")
    private Integer totalStages;

    @Column(name = "current_stage")
    private Integer currentStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "workflow_status")
    private WorkflowStatus workflowStatus;

    @Column(name = "submitted_date")
    private LocalDateTime submittedDate;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    private String remarks;
}
