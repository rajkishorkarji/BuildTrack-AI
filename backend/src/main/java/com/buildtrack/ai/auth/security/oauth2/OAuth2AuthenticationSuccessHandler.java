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

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found after OAuth2 login"));

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

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/redirect")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken.getToken())
                .queryParam("email", user.getEmail())
                .queryParam("role", mainRole)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
