package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.report.ReportCreateRequest;
import com.buildtrack.ai.dto.report.ReportResponse;
import com.buildtrack.ai.service.ReportService;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize(
        "hasAnyRole(" +
        "'SUPER_ADMIN'," +
        "'COMPANY_ADMIN'," +
        "'PROJECT_MANAGER'" +
        ")"
)
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getReports(
            @RequestParam(required = false) Long projectId
    ) {

        User user =
                tenantAccessService.currentUser();

        return ResponseEntity.ok(
                ApiResponse.success(
                        reportService.getReports(
                                user,
                                projectId
                        )
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody ReportCreateRequest request
    ) {

        User user =
                tenantAccessService.currentUser();

        return ResponseEntity.ok(
                ApiResponse.success(
                        reportService.createReport(
                                request,
                                user
                        )
                )
        );
    }
}