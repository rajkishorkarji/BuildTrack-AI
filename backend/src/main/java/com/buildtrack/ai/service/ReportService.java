package com.buildtrack.ai.service;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.report.ReportCreateRequest;
import com.buildtrack.ai.dto.report.ReportResponse;
import java.util.List;
public interface ReportService {
    List<ReportResponse> getReports(User user, Long projectId);
    ReportResponse createReport(ReportCreateRequest request, User user);
}
