package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.repository.AttendanceRepository;
import com.buildtrack.ai.repository.WorkerRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.service.AttendanceService;
import com.buildtrack.ai.service.RealtimePublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private RealtimePublisher realtimePublisher;

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public List<Attendance> getAttendanceByCompany(Long companyId) {
        return attendanceRepository.findByProjectCompanyId(companyId);
    }

    @Override
    public Attendance checkInWorker(Attendance attendance) {
        if (attendance.getWorker() == null || attendance.getWorker().getId() == null) {
            throw new IllegalArgumentException("A worker is required for attendance check-in");
        }
        attendance.setWorker(workerRepository.findById(attendance.getWorker().getId())
                .orElseThrow(() -> new IllegalArgumentException("Worker not found")));
        if (attendance.getProject() != null && attendance.getProject().getId() != null) {
            attendance.setProject(projectRepository.findById(attendance.getProject().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found")));
        }
        if (attendance.getStatus() == null) {
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        }
        Attendance saved = attendanceRepository.save(attendance);
        realtimePublisher.publish("attendance", "checked_in", saved.getId());
        return saved;
    }

    @Override
    public Attendance checkOutWorker(Long attendanceId) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found with id: " + attendanceId));
        attendance.setCheckOut(LocalDateTime.now());
        Attendance saved = attendanceRepository.save(attendance);
        realtimePublisher.publish("attendance", "checked_out", saved.getId());
        return saved;
    }

    @Override
    public Attendance verifyAttendance(Long attendanceId, boolean verified) {
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found with id: " + attendanceId));
        attendance.setVerificationStatus(verified ? "VERIFIED" : "REJECTED");
        Attendance saved = attendanceRepository.save(attendance);
        realtimePublisher.publish("attendance", verified ? "verified" : "rejected", saved.getId());
        return saved;
    }
}
