package com.projectmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "faculty")
@Data
@EqualsAndHashCode(callSuper = true)
public class Faculty extends User {

    private String designation;

    private String employeeId;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Department department;
}