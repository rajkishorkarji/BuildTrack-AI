package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.attendance.AttendanceQrCheckInRequest;
import com.buildtrack.ai.dto.attendance.AttendanceRequest;
import com.buildtrack.ai.dto.attendance.AttendanceResponse;
import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.service.AttendanceService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AttendanceResponse>>> getAttendanceLogs() {
        User user = tenantAccessService.currentUser();
        List<AttendanceResponse> rows = attendanceService.getAttendanceForUser(user).stream().map(AttendanceResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.success(rows));
    }

    @PostMapping("/check-in")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkIn(@Valid @RequestBody AttendanceRequest request) {
        Attendance saved = attendanceService.checkIn(request, tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(AttendanceResponse.from(saved)));
    }

    @PostMapping("/check-in/qr")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkInByQr(@Valid @RequestBody AttendanceQrCheckInRequest request) {
        Attendance saved = attendanceService.checkInByQr(request, tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(AttendanceResponse.from(saved)));
    }

    @PatchMapping("/{id}/check-out")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceResponse>> checkOut(@PathVariable Long id) {
        Attendance saved = attendanceService.checkOutWorker(id, tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(AttendanceResponse.from(saved)));
    }

    @PatchMapping("/{id}/verification")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendanceResponse>> verify(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Attendance saved = attendanceService.verifyAttendance(id, Boolean.TRUE.equals(body.get("verified")), tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(AttendanceResponse.from(saved)));
    }
}
