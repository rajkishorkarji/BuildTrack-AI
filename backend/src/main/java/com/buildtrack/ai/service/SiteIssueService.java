package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.issue.IssueRequest;
import com.buildtrack.ai.dto.issue.IssueResponse;

import java.util.List;

public interface SiteIssueService {
    List<IssueResponse> list(User user);
    IssueResponse create(IssueRequest request, User user);
    IssueResponse updateStatus(Long id, String status, User user);
}
