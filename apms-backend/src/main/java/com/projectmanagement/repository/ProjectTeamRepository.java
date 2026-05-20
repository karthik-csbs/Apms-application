package com.projectmanagement.repository;

import com.projectmanagement.entity.ProjectTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, Long> {
}
