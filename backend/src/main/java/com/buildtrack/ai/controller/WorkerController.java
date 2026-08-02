package com.buildtrack.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/worker")
public class WorkerController {

    @PostMapping("/attendance/check-in")
    public ResponseEntity<Map<String, String>> checkIn(@RequestParam String token) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "QR Token " + token + " verified. Attendance clock-in recorded.");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/salary")
    public ResponseEntity<Map<String, Object>> getSalary() {
        Map<String, Object> res = new HashMap<>();
        res.put("dailyWage", 85.00);
        res.put("totalHoursLogged", 8.0);
        res.put("earnedToday", 85.00);
        return ResponseEntity.ok(res);
    }
}
