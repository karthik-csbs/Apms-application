package com.projectmanagement.repository;

import com.projectmanagement.entity.Meeting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    @Query("SELECT DISTINCT m FROM Meeting m " +
           "LEFT JOIN FETCH m.project p " +
           "LEFT JOIN FETCH m.department d " +
           "LEFT JOIN FETCH m.createdBy c " +
           "LEFT JOIN FETCH m.faculty f " +
           "WHERE (:today IS NULL OR m.meetingDate >= :today) " +
           "AND (:todayPast IS NULL OR m.meetingDate < :todayPast) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Meeting> findAllMeetings(
            @Param("today") LocalDate today,
            @Param("todayPast") LocalDate todayPast,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT DISTINCT m FROM Meeting m " +
           "LEFT JOIN FETCH m.project p " +
           "LEFT JOIN FETCH m.department d " +
           "LEFT JOIN FETCH m.createdBy c " +
           "LEFT JOIN FETCH m.faculty f " +
           "WHERE (m.department.id = :deptId OR m.createdBy.id = :userId) " +
           "AND (:today IS NULL OR m.meetingDate >= :today) " +
           "AND (:todayPast IS NULL OR m.meetingDate < :todayPast) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Meeting> findMeetingsForHod(
            @Param("userId") Long userId,
            @Param("deptId") Long deptId,
            @Param("today") LocalDate today,
            @Param("todayPast") LocalDate todayPast,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT DISTINCT m FROM Meeting m " +
           "LEFT JOIN FETCH m.participants mp " +
           "LEFT JOIN FETCH m.project p " +
           "LEFT JOIN FETCH m.department d " +
           "LEFT JOIN FETCH m.createdBy c " +
           "LEFT JOIN FETCH m.faculty f " +
           "WHERE (m.createdBy.id = :userId OR mp.user.id = :userId OR p.facultyGuide.id = :userId) " +
           "AND (:today IS NULL OR m.meetingDate >= :today) " +
           "AND (:todayPast IS NULL OR m.meetingDate < :todayPast) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Meeting> findMeetingsForFaculty(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            @Param("todayPast") LocalDate todayPast,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT DISTINCT m FROM Meeting m " +
           "LEFT JOIN FETCH m.participants mp " +
           "LEFT JOIN FETCH m.project p " +
           "LEFT JOIN FETCH m.department d " +
           "LEFT JOIN FETCH m.createdBy c " +
           "LEFT JOIN FETCH m.faculty f " +
           "LEFT JOIN p.teamMembers pt " +
           "WHERE (mp.user.id = :userId OR pt.student.id = :userId) " +
           "AND (:today IS NULL OR m.meetingDate >= :today) " +
           "AND (:todayPast IS NULL OR m.meetingDate < :todayPast) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Meeting> findMeetingsForStudent(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            @Param("todayPast") LocalDate todayPast,
            @Param("search") String search,
            Pageable pageable
    );

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM meetings WHERE faculty_id IS NULL", nativeQuery = true)
    void deleteMeetingsWithNullFaculty();
}
