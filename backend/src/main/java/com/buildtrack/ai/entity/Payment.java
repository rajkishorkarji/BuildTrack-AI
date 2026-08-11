package com.buildtrack.ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments",
       indexes = {
           @Index(name = "idx_payments_company", columnList = "company_id"),
           @Index(name = "idx_payments_order", columnList = "razorpay_order_id"),
           @Index(name = "idx_payments_payment", columnList = "razorpay_payment_id")
       })
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transactionRef;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(nullable = false, length = 40)
    private String paymentMethod;

    @Column(nullable = false, length = 40)
    private String category;

    @Column(length = 120, unique = true)
    private String razorpayOrderId;

    @Column(length = 120, unique = true)
    private String razorpayPaymentId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(length = 60)
    private String planCode;

    @Column(length = 120)
    private String planName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime paymentDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @PrePersist
    void onCreate() {
        if (paymentDate == null) paymentDate = LocalDateTime.now();
        if (status == null) status = PaymentStatus.PENDING;
        if (currency == null) currency = "INR";
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }
}
