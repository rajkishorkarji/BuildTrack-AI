package com.buildtrack.ai.auth.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public EmailVerificationToken() {}

    public EmailVerificationToken(Long id, String token, Instant expiryDate, User user) {
        this.id = id;
        this.token = token;
        this.expiryDate = expiryDate;
        this.user = user;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Instant getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Instant expiryDate) { this.expiryDate = expiryDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public static EmailVerificationTokenBuilder builder() { return new EmailVerificationTokenBuilder(); }

    public static class EmailVerificationTokenBuilder {
        private Long id;
        private String token;
        private Instant expiryDate;
        private User user;

        public EmailVerificationTokenBuilder id(Long id) { this.id = id; return this; }
        public EmailVerificationTokenBuilder token(String token) { this.token = token; return this; }
        public EmailVerificationTokenBuilder expiryDate(Instant expiryDate) { this.expiryDate = expiryDate; return this; }
        public EmailVerificationTokenBuilder user(User user) { this.user = user; return this; }

        public EmailVerificationToken build() {
            return new EmailVerificationToken(id, token, expiryDate, user);
        }
    }
}
