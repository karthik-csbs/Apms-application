package com.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = true)
    private String description;

    @Column(nullable = true)
    private String technologies;

    private String duration;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status = ProjectStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ProjectType projectType;

    private String completionStatus; // e.g., PENDING_APPROVAL, APPROVED, REJECTED

    private String githubUrl;
    private String driveUrl;
    private String documentUrl;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Department department;

    @ManyToOne
    @JoinColumn(name = "faculty_guide_id")
    @JsonIgnoreProperties({"password", "createdAt", "role", "email", "enabled", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "department"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User facultyGuide;

    @ManyToOne
    @JoinColumn(name = "team_lead_id")
    @JsonIgnoreProperties({"password", "createdAt", "role", "email", "enabled", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "department"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User teamLead;

    @ManyToMany
    @JoinTable(
        name = "project_students",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnoreProperties({"password", "createdAt", "role", "email", "enabled", "authorities", "username", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "department"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<User> assignedStudents = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProjectTeam> teamMembers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
