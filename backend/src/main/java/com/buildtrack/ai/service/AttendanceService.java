package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.attendance.AttendanceQrCheckInRequest;
import com.buildtrack.ai.dto.attendance.AttendanceRequest;
import com.buildtrack.ai.entity.Attendance;

import java.util.List;

public interface AttendanceService {
    List<Attendance> getAttendanceForUser(User user);
    Attendance checkIn(AttendanceRequest request, User actor);
    Attendance checkInByQr(AttendanceQrCheckInRequest request, User actor);
    Attendance checkOutWorker(Long attendanceId, User actor);
    Attendance verifyAttendance(Long attendanceId, boolean verified, User actor);
}
