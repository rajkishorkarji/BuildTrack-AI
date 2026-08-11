package com.buildtrack.ai.payment;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.service.TenantAccessService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final TenantAccessService tenantAccessService;
    private final ObjectMapper objectMapper;

    @GetMapping("/razorpay/plans")
    public ResponseEntity<ApiResponse<Map<String, Object>>> plans() {
        tenantAccessService.requireCompanyAdmin(tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(razorpayService.getPlans()));
    }

    @PostMapping("/razorpay/order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            @Valid @RequestBody PaymentOrderRequest request) {

        tenantAccessService.requireCompanyAdmin(tenantAccessService.currentUser());

        return ResponseEntity.ok(
                ApiResponse.success(
                        razorpayService.createSubscriptionOrder(request.planCode())
                )
        );
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verify(
            @Valid @RequestBody PaymentVerifyRequest request) {

        tenantAccessService.requireCompanyAdmin(tenantAccessService.currentUser());

        return ResponseEntity.ok(
                ApiResponse.success(razorpayService.verifyPayment(request))
        );
    }

    @GetMapping("/subscription")
    public ResponseEntity<ApiResponse<Map<String, Object>>> subscription() {
        tenantAccessService.requireCompanyAdmin(tenantAccessService.currentUser());
        var company = tenantAccessService.currentCompany();
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "plan", company.getPlan(),
                "status", company.getSubscriptionStatus(),
                "activatedAt", company.getSubscriptionActivatedAt() == null
                        ? "" : company.getSubscriptionActivatedAt().toString()
        )));
    }

    @GetMapping("/company")
    public ResponseEntity<ApiResponse<Map<String, Object>>> companyPayments() {
        tenantAccessService.requireCompanyAdmin(tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(razorpayService.getCompanyPayments()));
    }

    @PostMapping(value = "/razorpay/webhook", consumes = "application/json")
    public ResponseEntity<Void> webhook(
            @RequestHeader(name = "X-Razorpay-Signature", required = false) String signature,
            @RequestHeader(name = "x-razorpay-event-id", required = false) String eventId,
            @RequestBody String body) {

        try {
            JsonNode root = objectMapper.readTree(body);

            String event = root.path("event").asText("");
            JsonNode paymentEntity = root.path("payload")
                    .path("payment")
                    .path("entity");

            if (paymentEntity.isMissingNode() || paymentEntity.isNull()) {
                paymentEntity = root.path("payload")
                        .path("order")
                        .path("entity");
            }

            String paymentId = paymentEntity.path("id").asText(null);
            String orderId = paymentEntity.path("order_id").asText(null);

            if (orderId == null || orderId.isBlank()) {
                orderId = root.path("payload")
                        .path("order")
                        .path("entity")
                        .path("id")
                        .asText(null);
            }

            razorpayService.handleWebhook(
                    signature,
                    body,
                    eventId,
                    event,
                    orderId,
                    paymentId
            );

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Webhook failures must return a non-2xx response so Razorpay can retry.
            throw new IllegalArgumentException("Invalid Razorpay webhook payload", e);
        }
    }
}
