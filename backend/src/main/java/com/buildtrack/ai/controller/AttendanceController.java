package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PatchMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<Attendance>> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.checkOutWorker(id)));
    }

    @PatchMapping("/{id}/verification")
    public ResponseEntity<ApiResponse<Attendance>> verify(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.verifyAttendance(id, Boolean.TRUE.equals(body.get("verified"))));
    }
}
