package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByWorkerId(Long workerId);
    List<Attendance> findByProjectId(Long projectId);
}
