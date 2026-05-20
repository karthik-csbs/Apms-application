package com.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String technologies;

    private String duration;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ProjectType projectType;

    private String completionStatus; // e.g., PENDING_APPROVAL, APPROVED, REJECTED

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "faculty_guide_id")
    private Faculty facultyGuide;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
