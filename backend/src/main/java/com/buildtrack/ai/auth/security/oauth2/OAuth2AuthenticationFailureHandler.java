package com.buildtrack.ai.auth.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
            throws IOException, ServletException {
        String errorMessage = exception.getMessage() != null ? exception.getMessage() : "Google authentication failed.";

        String redirectBase = frontendUrl;
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        if (forwardedHost != null && !forwardedHost.isBlank()) {
            if (forwardedHost.contains(",")) {
                forwardedHost = forwardedHost.split(",")[0].trim();
            }
            String scheme = "http";
            if (forwardedProto != null && !forwardedProto.isBlank()) {
                scheme = forwardedProto.split(",")[0].trim();
            } else if (request.isSecure() || "443".equals(request.getHeader("X-Forwarded-Port"))) {
                scheme = "https";
            }
            if (!"https".equalsIgnoreCase(scheme)) {
                scheme = "http";
            }
            redirectBase = scheme + "://" + forwardedHost;
        }

        if (redirectBase == null || redirectBase.isBlank() || redirectBase.contains(",")) {
            redirectBase = "http://localhost";
        }

        if (redirectBase.endsWith("/")) {
            redirectBase = redirectBase.substring(0, redirectBase.length() - 1);
        }

        String targetUrl = UriComponentsBuilder.fromUriString(redirectBase + "/login")
                .queryParam("error", errorMessage)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
