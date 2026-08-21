package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Attendance;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    @EntityGraph(attributePaths = {"worker", "project"})
    List<Attendance> findByWorkerIdOrderByCheckInDesc(Long workerId);

    @EntityGraph(attributePaths = {"worker", "project"})
    List<Attendance> findByProjectIdOrderByCheckInDesc(Long projectId);

    @EntityGraph(attributePaths = {"worker", "project"})
    List<Attendance> findByProjectCompanyIdOrderByCheckInDesc(Long companyId);

    @EntityGraph(attributePaths = {"worker", "project"})
    @Query("select a from Attendance a where a.worker.id = :workerId and a.checkIn >= :from and a.checkIn < :to order by a.checkIn desc")
    List<Attendance> findWorkerForDay(@Param("workerId") Long workerId,
                                      @Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);

    @EntityGraph(attributePaths = {"worker", "project"})
    @Query("select a from Attendance a where a.worker.id = :workerId and a.checkOut is null order by a.checkIn desc")
    Optional<Attendance> findOpenByWorkerId(@Param("workerId") Long workerId);

    @Override
    @EntityGraph(attributePaths = {"worker", "project"})
    List<Attendance> findAll();

    @Override
    @EntityGraph(attributePaths = {"worker", "project"})
    Optional<Attendance> findById(Long id);
}
