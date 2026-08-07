package com.buildtrack.ai.auth.service.impl;

import com.buildtrack.ai.auth.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@buildtrack.ai}")
    private String fromEmail;

    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "BuildTrack AI - Verify Your Account Email";
        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-bottom: 16px;">Welcome to BuildTrack AI</h2>
                <p style="font-size: 15px; color: #334155;">Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                <div style="margin: 24px 0;">
                    <a href="%s" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
                </div>
                <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser: <br><a href="%s" style="color: #2563eb;">%s</a></p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8;">This verification link will expire in 24 hours.</p>
            </div>
            """.formatted(verificationUrl, verificationUrl, verificationUrl);

        sendHtmlEmail(toEmail, subject, content);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String subject = "BuildTrack AI - Password Reset Request";
        String content = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #dc2626; margin-bottom: 16px;">Password Reset Request</h2>
                <p style="font-size: 15px; color: #334155;">We received a request to reset your password. Click the button below to proceed:</p>
                <div style="margin: 24px 0;">
                    <a href="%s" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser: <br><a href="%s" style="color: #dc2626;">%s</a></p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, please ignore this email. This link expires in 1 hour.</p>
            </div>
            """.formatted(resetUrl, resetUrl, resetUrl);

        sendHtmlEmail(toEmail, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
