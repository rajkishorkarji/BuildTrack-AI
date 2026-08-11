package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByWorkerIdOrderByCheckInDesc(Long workerId);
    List<Attendance> findByProjectIdOrderByCheckInDesc(Long projectId);
    List<Attendance> findByProjectCompanyIdOrderByCheckInDesc(Long companyId);

    @Query("select a from Attendance a where a.worker.id = :workerId and a.checkIn >= :from and a.checkIn < :to order by a.checkIn desc")
    List<Attendance> findWorkerForDay(@Param("workerId") Long workerId,
                                      @Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to);

    @Query("select a from Attendance a where a.worker.id = :workerId and a.checkOut is null order by a.checkIn desc")
    Optional<Attendance> findOpenByWorkerId(@Param("workerId") Long workerId);
}
