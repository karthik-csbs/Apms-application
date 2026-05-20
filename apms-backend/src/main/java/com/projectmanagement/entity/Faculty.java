package com.projectmanagement.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "faculty")
@Data
@EqualsAndHashCode(callSuper = true)
public class Faculty extends User {

    private String designation;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}
