package com.buildtrack.ai.auth.service;

public interface EmailService {
    void sendVerificationEmail(String toEmail, String token);
    void sendPasswordResetEmail(String toEmail, String token);
}
