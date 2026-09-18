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
        User user = tenantAccessService.currentUser();
        List<Notification> list = tenantAccessService.isSuperAdmin(user)
                ? notificationService.getNotifications()
                : notificationService.getNotificationsForUser(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<Notification>>> createNotification(@RequestBody BroadcastRequest request) {
        User sender = tenantAccessService.currentUser();
        String target = request.targetRole() == null ? "" : request.targetRole().toUpperCase();
        if (tenantAccessService.isSuperAdmin(sender)) {
            if (target.isBlank()) target = "COMPANY_ADMIN";
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
        if (tenantAccessService.isSuperAdmin(user)) {
            notificationService.markAllAsRead();
        } else {
            notificationService.markAllAsReadForUser(user);
        }
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markOneRead(@PathVariable Long id) {
        User user = tenantAccessService.currentUser();
        notificationService.markAsReadForUser(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    public record BatchDeleteRequest(List<Long> ids) {}

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable Long id) {
        User user = tenantAccessService.currentUser();
        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
    }

    @PostMapping("/batch-delete")
    public ResponseEntity<ApiResponse<String>> deleteBatchPost(@RequestBody BatchDeleteRequest request) {
        User user = tenantAccessService.currentUser();
        notificationService.deleteNotifications(request != null ? request.ids() : List.of(), user);
        return ResponseEntity.ok(ApiResponse.success("Notifications deleted successfully"));
    }

    @DeleteMapping("/batch")
    public ResponseEntity<ApiResponse<String>> deleteBatchDelete(@RequestBody BatchDeleteRequest request) {
        User user = tenantAccessService.currentUser();
        notificationService.deleteNotifications(request != null ? request.ids() : List.of(), user);
        return ResponseEntity.ok(ApiResponse.success("Notifications deleted successfully"));
    }

    @DeleteMapping("/all")
    public ResponseEntity<ApiResponse<String>> deleteAll() {
        User user = tenantAccessService.currentUser();
        notificationService.deleteAllNotificationsForUser(user);
        return ResponseEntity.ok(ApiResponse.success("All notifications deleted successfully"));
    }
}
