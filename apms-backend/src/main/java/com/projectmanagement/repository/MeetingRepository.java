package com.projectmanagement.repository;

import com.projectmanagement.entity.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    @Query("SELECT DISTINCT m FROM Meeting m " +
           "LEFT JOIN m.participants mp " +
           "LEFT JOIN m.project p " +
           "LEFT JOIN p.teamMembers pt " +
           "WHERE (:role = 'ADMIN' OR :role = 'PRINCIPAL' " +
           "OR (:role = 'HOD' AND (m.department.id = :deptId OR m.createdBy.id = :userId)) " +
           "OR (:role = 'FACULTY' AND (m.createdBy.id = :userId OR mp.user.id = :userId OR p.facultyGuide.id = :userId)) " +
           "OR (:role = 'STUDENT' AND (mp.user.id = :userId OR pt.student.id = :userId))) " +
           "AND (:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Meeting> findMyMeetings(
            @Param("userId") Long userId,
            @Param("role") String role,
            @Param("deptId") Long deptId,
            @Param("search") String search,
            Pageable pageable
    );
}
