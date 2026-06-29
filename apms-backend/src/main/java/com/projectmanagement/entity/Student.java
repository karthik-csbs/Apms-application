package com.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Data
@EqualsAndHashCode(callSuper = true)
public class Student extends User {

    @Column(nullable = false, unique = true)
    private String registerNumber;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Department department;

    private String mobile;

    @Column(columnDefinition = "TEXT")
    private String skills;

    private String githubProfile;

    private String linkedinUrl;

    private String resumeUrl;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Faculty faculty;

    private java.time.LocalDateTime lastCredentialEmailSent;

    @Column(length = 50)
    private String emailDeliveryStatus;
}