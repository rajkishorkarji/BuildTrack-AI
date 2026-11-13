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

    @Value("${brevo.api-key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    @Value("${resend.api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    private final java.net.http.HttpClient httpClient = java.net.http.HttpClient.newBuilder()
            .connectTimeout(java.time.Duration.ofSeconds(10))
            .build();

    private final java.util.concurrent.ExecutorService emailExecutor = java.util.concurrent.Executors.newCachedThreadPool();

    @jakarta.annotation.PreDestroy
    public void cleanup() {
        try {
            emailExecutor.shutdown();
        } catch (Exception ignored) {
        }
    }

    private String getEffectiveFrontendUrl() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String origin = request.getHeader("Origin");
                if (origin != null && !origin.isBlank() && !origin.equals("null")) {
                    return origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin;
                }
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.isBlank()) {
                    java.net.URI uri = new java.net.URI(referer);
                    return uri.getScheme() + "://" + uri.getAuthority();
                }
            }
        } catch (Exception ignored) {
        }

        String base = frontendUrl;
        if (base != null && !base.isBlank()) {
            if (!base.startsWith("http://") && !base.startsWith("https://")) {
                if (!base.contains(".") && !base.contains("localhost")) {
                    base = base + ".onrender.com";
                }
                base = "https://" + base;
            }
            if (base.endsWith("/")) {
                base = base.substring(0, base.length() - 1);
            }
            return base;
        }
        return "http://localhost:5173";
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
            <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;">
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="font-size:22px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">BuildTrack AI</div>
                    <div style="font-size:12px;color:#64748b;margin-top:2px;">Construction Workforce & Project Management Platform</div>
                </div>

                <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #f1f5f9;margin-bottom:24px;">
                    <h3 style="color:#0f172a;margin:0 0 10px 0;font-size:18px;">Welcome to BuildTrack AI</h3>
                    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;">
                        Hello <strong>%s</strong>,<br/><br/>
                        You have been invited to become the <strong>Company Administrator</strong> for <strong>%s</strong>.
                    </p>
                </div>

                <p style="font-size:14px;color:#475569;line-height:1.6;margin-bottom:24px;">
                    Click the button below to accept your invitation and create your account password:
                </p>

                <div style="text-align:center;margin:28px 0;">
                    <a href="%s"
                       style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        Accept Invitation & Set Password
                    </a>
                </div>

                <div style="text-align:center;margin:16px 0 24px 0;">
                    <p style="font-size:13px;color:#64748b;margin:0 0 6px 0;">
                        Or copy and paste this invitation link directly into your browser:
                    </p>
                    <a href="%s" style="color:#2563eb;font-size:13px;word-break:break-all;text-decoration:underline;font-weight:600;">
                        %s
                    </a>
                </div>

                <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:28px;text-align:center;">
                    <p style="font-size:12px;color:#94a3b8;margin:0;">
                        This invitation link is valid for 24 hours. If you did not expect this invitation, please ignore this email.
                    </p>
                </div>
            </div>
            """.formatted(
                adminName,
                companyName,
                invitationUrl,
                invitationUrl,
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
            <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;">
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="font-size:22px;font-weight:800;color:#2563eb;letter-spacing:-0.5px;">BuildTrack AI</div>
                    <div style="font-size:12px;color:#64748b;margin-top:2px;">Construction Workforce & Project Management Platform</div>
                </div>

                <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #f1f5f9;margin-bottom:24px;">
                    <h3 style="color:#0f172a;margin:0 0 10px 0;font-size:18px;">You're Invited to Join BuildTrack AI</h3>
                    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;">
                        Hello <strong>%s</strong>,<br/><br/>
                        You have been invited by <strong>%s</strong> to join their team as <strong>%s</strong>.
                    </p>
                </div>

                <p style="font-size:14px;color:#475569;line-height:1.6;margin-bottom:24px;">
                    Click the button below to accept your invitation and create your account password:
                </p>

                <div style="text-align:center;margin:28px 0;">
                    <a href="%s"
                       style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(37,99,235,0.25);">
                        Accept Invitation & Set Password
                    </a>
                </div>

                <div style="text-align:center;margin:16px 0 24px 0;">
                    <p style="font-size:13px;color:#64748b;margin:0 0 6px 0;">
                        Or copy and paste this invitation link directly into your browser:
                    </p>
                    <a href="%s" style="color:#2563eb;font-size:13px;word-break:break-all;text-decoration:underline;font-weight:600;">
                        %s
                    </a>
                </div>

                <div style="border-top:1px solid #f1f5f9;padding-top:16px;margin-top:28px;text-align:center;">
                    <p style="font-size:12px;color:#94a3b8;margin:0;">
                        This invitation link is valid for 24 hours. If you did not expect this invitation, please ignore this email.
                    </p>
                </div>
            </div>
            """.formatted(fullName, companyName, role.replace('_', ' '), invitationUrl, invitationUrl, invitationUrl);
        sendHtmlEmail(toEmail, subject, content);
    }

    private String getFromAddress() {
        if (fromEmail != null && !fromEmail.isBlank() && fromEmail.contains("@") && !fromEmail.contains("noreply")) {
            return fromEmail.trim();
        }
        return "rajkishorkarji07@gmail.com";
    }

    private void sendHtmlEmail(String to, String subject, String body) {
        String senderAddr = getFromAddress();

        emailExecutor.submit(() -> {
            // Priority 1: Brevo HTTP API (Port 443 - never blocked by cloud hosts like Render)
            if (brevoApiKey != null && !brevoApiKey.isBlank()) {
                try {
                    sendViaBrevo(to, subject, body, senderAddr);
                    log.info("Email successfully sent via Brevo HTTPS API to {}", to);
                    return;
                } catch (Exception e) {
                    log.error("Failed to send email via Brevo API to {}. Error: {}", to, e.getMessage(), e);
                }
            }

            // Priority 2: Resend HTTP API (Port 443)
            if (resendApiKey != null && !resendApiKey.isBlank()) {
                try {
                    sendViaResend(to, subject, body, senderAddr);
                    log.info("Email successfully sent via Resend HTTPS API to {}", to);
                    return;
                } catch (Exception e) {
                    log.error("Failed to send email via Resend API to {}. Error: {}", to, e.getMessage(), e);
                }
            }

            // Priority 3: Fallback to standard SMTP (Port 587/465)
            int maxAttempts = 2;
            for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    MimeMessage message = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    helper.setFrom(senderAddr, "BuildTrack AI");
                    helper.setReplyTo(senderAddr, "BuildTrack AI");
                    helper.setTo(to);
                    helper.setSubject(subject);

                    String plainText = body.replaceAll("<style[^>]*>.*?</style>", "")
                                           .replaceAll("<[^>]*>", " ")
                                           .replaceAll("&nbsp;", " ")
                                           .replaceAll("\\s+", " ")
                                           .trim();
                    helper.setText(plainText, body);
                    mailSender.send(message);
                    log.info("Email successfully sent to {} from {} (attempt {})", to, senderAddr, attempt);
                    return;
                } catch (Exception e) {
                    log.error("Failed to send email to {} from {} (attempt {}/{}). Error: {}",
                            to, senderAddr, attempt, maxAttempts, e.getMessage(), e);
                    if (attempt < maxAttempts) {
                        try {
                            Thread.sleep(2000);
                        } catch (InterruptedException ignored) {
                        }
                    }
                }
            }
        });
    }

    private void sendViaBrevo(String to, String subject, String body, String senderAddr) throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("sender", java.util.Map.of("name", "BuildTrack AI", "email", senderAddr));
        payload.put("to", java.util.List.of(java.util.Map.of("email", to)));
        payload.put("subject", subject);
        payload.put("htmlContent", body);

        String jsonPayload = mapper.writeValueAsString(payload);

        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("api-key", brevoApiKey.trim())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                .timeout(java.time.Duration.ofSeconds(15))
                .build();

        java.net.http.HttpResponse<String> response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new RuntimeException("Brevo API returned status " + response.statusCode() + ": " + response.body());
        }
    }

    private void sendViaResend(String to, String subject, String body, String senderAddr) throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        // If domain is not verified on Resend, onboarding@resend.dev must be used
        String from = senderAddr.contains("@") && !senderAddr.endsWith("@gmail.com") 
                ? "BuildTrack AI <" + senderAddr + ">" 
                : "BuildTrack AI <onboarding@resend.dev>";
        payload.put("from", from);
        payload.put("to", java.util.List.of(to));
        payload.put("subject", subject);
        payload.put("html", body);

        String jsonPayload = mapper.writeValueAsString(payload);

        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.resend.com/emails"))
                .header("Authorization", "Bearer " + resendApiKey.trim())
                .header("Content-Type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload, java.nio.charset.StandardCharsets.UTF_8))
                .timeout(java.time.Duration.ofSeconds(15))
                .build();

        java.net.http.HttpResponse<String> response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 400) {
            throw new RuntimeException("Resend API returned status " + response.statusCode() + ": " + response.body());
        }
    }

    
}
