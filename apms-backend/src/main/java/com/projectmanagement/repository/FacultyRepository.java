package com.projectmanagement.repository;

import com.projectmanagement.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    java.util.Optional<Faculty> findByEmail(String email);
}
