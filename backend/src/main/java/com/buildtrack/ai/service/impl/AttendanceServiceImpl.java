package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.repository.AttendanceRepository;
import com.buildtrack.ai.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Attendance checkInWorker(Attendance attendance) {
        if (attendance.getStatus() == null) {
            attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        }
        return attendanceRepository.save(attendance);
    }
}
