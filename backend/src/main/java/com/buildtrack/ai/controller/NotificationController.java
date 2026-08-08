package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Notification;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.notification.BroadcastRequest;
import com.buildtrack.ai.service.TenantAccessService;
import com.buildtrack.ai.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private TenantAccessService tenantAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getNotificationsForUser(tenantAccessService.currentUser())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<Notification>>> createNotification(@RequestBody BroadcastRequest request) {
        User sender = tenantAccessService.currentUser();
        String target = request.targetRole() == null ? "" : request.targetRole().toUpperCase();
        if (tenantAccessService.isSuperAdmin(sender)) {
            if (!"COMPANY_ADMIN".equals(target)) throw new IllegalArgumentException("Super Admin broadcasts may only target Company Admins");
        } else {
            tenantAccessService.requireCompanyAdmin(sender);
            tenantAccessService.requireActiveSubscription(tenantAccessService.currentCompany());
            if (!List.of("PROJECT_MANAGER", "SITE_ENGINEER", "CONTRACTOR", "WORKER").contains(target)) {
                throw new IllegalArgumentException("Company Admin broadcasts may only target company delivery roles");
            }
        }
        return ResponseEntity.ok(ApiResponse.success(notificationService.broadcast(sender, target, request.title(), request.message(), request.type())));
    }

    @PutMapping("/mark-read")
    public ResponseEntity<ApiResponse<String>> markRead() {
        User user = tenantAccessService.currentUser();
        notificationService.getNotificationsForUser(user).forEach(item -> notificationService.markAsReadForUser(item.getId(), user));
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markOneRead(@PathVariable Long id) {
        notificationService.markAsReadForUser(id, tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }
}
