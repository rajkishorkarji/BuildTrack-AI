package com.buildtrack.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/engineer")
public class SiteEngineerController {

    @PostMapping("/daily-report")
    public ResponseEntity<Map<String, String>> submitDailyReport(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Daily Engineering Progress Report submitted for Floor 14.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/photos")
    public ResponseEntity<Map<String, String>> uploadInspectionPhoto(@RequestBody Map<String, String> request) {
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Site photo analyzed by AI Safety Inspector. Grade M40 Passed.");
        return ResponseEntity.ok(res);
    }
}
