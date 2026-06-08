package com.projectmanagement.entity;

import com.projectmanagement.audit.Auditable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_stage")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStage extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "workflow_id", nullable = false)
    private Workflow workflow;

    @Column(name = "stage_number")
    private Integer stageNumber;

    @Column(name = "stage_name")
    private String stageName;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage_status")
    private WorkflowStageStatus stageStatus;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "reviewed_date")
    private LocalDateTime reviewedDate;

    private String remarks;
}
