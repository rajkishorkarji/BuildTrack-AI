package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceLogs() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getAllAttendance()));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<Attendance>> checkIn(@RequestBody Attendance attendance) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.checkInWorker(attendance)));
    }
}
