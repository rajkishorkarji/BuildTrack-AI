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

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:noreply@buildtrack.ai}")
    private String fromEmail;

    private String getEffectiveFrontendUrl() {
        if (frontendUrl != null && !frontendUrl.contains("localhost") && !frontendUrl.contains("127.0.0.1")) {
            return frontendUrl;
        }
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String origin = request.getHeader("Origin");
                if (origin != null && !origin.isBlank()) {
                    return origin;
                }
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.isBlank()) {
                    java.net.URI uri = new java.net.URI(referer);
                    return uri.getScheme() + "://" + uri.getAuthority();
                }
            }
        } catch (Exception ignored) {
        }
        return frontendUrl;
    }


    
    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        String verificationUrl = getEffectiveFrontendUrl() + "/verify-email?token=" + token;
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
        String resetUrl = getEffectiveFrontendUrl() + "/reset-password?token=" + token;
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

    @Override
    public void sendCompanyAdminInvitation(
            String toEmail,
            String adminName,
            String companyName,
            String invitationToken
    ) {
        String invitationUrl = getEffectiveFrontendUrl() + "/accept-invitation?token=" + invitationToken;

        log.info("\n============================================================\n[COMPANY ADMIN INVITATION]\nTo: {}\nCompany: {}\nInvitation Link: {}\n============================================================", toEmail, companyName, invitationUrl);

        String subject = "BuildTrack AI - Company Administrator Invitation";

        String content = """
            <div style="font-family:Arial,sans-serif;
                        max-width:600px;
                        margin:0 auto;
                        padding:30px;
                        border:1px solid #e2e8f0;
                        border-radius:12px;">

                <h2 style="color:#2563eb;">
                    Welcome to BuildTrack AI
                </h2>

                <p style="font-size:15px;color:#334155;">
                    Hello %s,
                </p>

                <p style="font-size:15px;color:#334155;">
                    You have been invited to become the
                    <strong>Company Administrator</strong>
                    for <strong>%s</strong>.
                </p>

                <p style="font-size:15px;color:#334155;">
                    Click the button below to accept your invitation
                    and create your password.
                </p>

                <div style="margin:30px 0;">
                    <a href="%s"
                       style="background:#2563eb;
                              color:white;
                              padding:13px 24px;
                              text-decoration:none;
                              border-radius:8px;
                              font-weight:bold;">
                        Accept Invitation
                    </a>
                </div>

                <p style="font-size:13px;color:#64748b;">
                    This invitation will expire in 24 hours.
                </p>

            </div>
            """.formatted(
                adminName,
                companyName,
                invitationUrl
            );

        sendHtmlEmail(
                toEmail,
                subject,
                content
        );
    }

    @Override
    public void sendPersonnelInvitation(String toEmail, String fullName, String role, String companyName, String invitationToken) {
        String invitationUrl = getEffectiveFrontendUrl() + "/accept-invitation?token=" + invitationToken;

        log.info("\n============================================================\n[PERSONNEL INVITATION]\nTo: {}\nRole: {}\nCompany: {}\nInvitation Link: {}\n============================================================", toEmail, role, companyName, invitationUrl);

        String subject = "BuildTrack AI - " + role.replace('_', ' ') + " Invitation";
        String content = """
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;border:1px solid #e2e8f0;border-radius:12px">
              <h2 style="color:#2563eb">BuildTrack AI</h2>
              <p>Hello %s,</p>
              <p>You have been invited by your <strong>Company Admin</strong> to join <strong>%s</strong> as <strong>%s</strong>.</p>
              <p>Use the button below to create your password and activate your account.</p>
              <p style="margin:28px 0"><a href="%s" style="background:#2563eb;color:#fff;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Accept Invitation</a></p>
              <p style="font-size:13px;color:#64748b">This invitation expires in 24 hours.</p>
            </div>
            """.formatted(fullName, companyName, role.replace('_', ' '), invitationUrl);
        sendHtmlEmail(toEmail, subject, content);
    }

    private String getFromAddress() {
        if (fromEmail != null && !fromEmail.isBlank()) {
            return fromEmail;
        }
        return "noreply@buildtrack.ai";
    }

    private void sendHtmlEmail(String to, String subject, String body) {
        String senderAddr = getFromAddress();
        if (senderAddr.equals("noreply@buildtrack.ai")) {
            log.warn("MAIL_USERNAME is not configured. Email to {} will likely fail. "
                    + "Set MAIL_USERNAME in .env to your Gmail address.", to);
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderAddr, "BuildTrack AI");
            helper.setReplyTo(senderAddr, "BuildTrack AI");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            log.info("Email successfully sent to {} from {}", to, senderAddr);
        } catch (Exception e) {
            log.error("Failed to send email to {} from {}. Error: {}",
                    to, senderAddr, e.getMessage(), e);
        }
    }

    
}
