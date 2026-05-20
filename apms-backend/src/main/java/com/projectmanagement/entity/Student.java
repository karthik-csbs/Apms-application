package com.projectmanagement.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "students")
@Data
@EqualsAndHashCode(callSuper = true)
public class Student extends User {

    @Column(nullable = false, unique = true)
    private String registerNumber;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}
