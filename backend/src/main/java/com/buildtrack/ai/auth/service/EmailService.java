package com.buildtrack.ai.auth.service;

public interface EmailService {

    void sendVerificationEmail(
            String toEmail,
            String token
    );

    void sendPasswordResetEmail(
            String toEmail,
            String token
    );

    void sendCompanyAdminInvitation(
            String toEmail,
            String adminName,
            String companyName,
            String invitationToken
    );

    void sendPersonnelInvitation(
            String toEmail,
            String fullName,
            String role,
            String companyName,
            String invitationToken
    );
}