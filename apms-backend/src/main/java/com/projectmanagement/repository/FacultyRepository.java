package com.projectmanagement.repository;

import com.projectmanagement.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    java.util.Optional<Faculty> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM Faculty f WHERE f.id = :userId")
    java.util.Optional<Faculty> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
    java.util.List<Faculty> findByDepartmentId(Long departmentId);
}
