package com.buildtrack.ai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String address;
    private String logoUrl;

    @Column(unique = true)
    private String code;

    private String adminName;
    private String adminEmail;
    private String plan = "Enterprise ($4,999/mo)";

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, SUSPENDED

    private LocalDateTime createdAt = LocalDateTime.now();

    public Company() {}

    public Company(String name, String email, String phone, String address) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    public Company(String name, String code, String adminName, String adminEmail, String phone, String address, String plan) {
        this.name = name;
        this.code = code;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.email = adminEmail != null ? adminEmail : email;
        this.phone = phone;
        this.address = address;
        this.plan = plan != null ? plan : "Enterprise ($4,999/mo)";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}