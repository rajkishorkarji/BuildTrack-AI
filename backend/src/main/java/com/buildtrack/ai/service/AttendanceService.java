package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Attendance;
import java.util.List;

public interface AttendanceService {
    List<Attendance> getAllAttendance();
    Attendance checkInWorker(Attendance attendance);
    Attendance checkOutWorker(Long attendanceId);
    Attendance verifyAttendance(Long attendanceId, boolean verified);
}
