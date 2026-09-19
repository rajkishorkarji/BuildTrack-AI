package com.buildtrack.ai.auth.security.oauth2;

import com.buildtrack.ai.auth.entity.RefreshToken;
import com.buildtrack.ai.auth.entity.Role;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.RefreshTokenRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.auth.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.buildtrack.ai.repository.CompanyRepository companyRepository;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .orElseThrow(() -> new IllegalArgumentException("User not found after OAuth2 login")));

        String mainRole = user.getRoles().stream().findFirst().map(Role::getRoleName).orElse("COMPANY_ADMIN");
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", mainRole);

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(user.getEmail(), "", List.of());

        String accessToken = jwtService.generateToken(userDetails, extraClaims);

        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusSeconds(7 * 24 * 3600))
                .build();
        refreshTokenRepository.save(refreshToken);

        String savedFullName = user.getFullName();
        if (savedFullName == null || savedFullName.isBlank()) {
            savedFullName = user.getEmail();
        }

        String companyName = "Platform";
        if (user.getCompanyId() != null) {
            companyName = companyRepository.findById(user.getCompanyId())
                    .map(com.buildtrack.ai.entity.Company::getName).orElse("Platform");
        }

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

        String targetUrl = UriComponentsBuilder.fromUriString(redirectBase + "/oauth2/redirect")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken.getToken())
                .queryParam("email", user.getEmail())
                .queryParam("role", mainRole)
                .queryParam("fullName", savedFullName)
                .queryParam("firstName", user.getFirstName() != null ? user.getFirstName() : "")
                .queryParam("lastName", user.getLastName() != null ? user.getLastName() : "")
                .queryParam("companyName", companyName)
                .queryParam("companyId", user.getCompanyId() != null ? String.valueOf(user.getCompanyId()) : "")
                .queryParam("companyCode", user.getCompanyCode() != null ? user.getCompanyCode() : "")
                .queryParam("provider", user.getProvider() != null ? user.getProvider().name() : "GOOGLE")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
