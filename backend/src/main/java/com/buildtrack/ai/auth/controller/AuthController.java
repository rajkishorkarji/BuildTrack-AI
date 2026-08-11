package com.buildtrack.ai.auth.controller;

import com.buildtrack.ai.auth.dto.*;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.RefreshTokenRepository;
import com.buildtrack.ai.auth.repository.UserInvitationRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final UserInvitationRepository userInvitationRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDataResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthDataResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.logout(request.refreshToken()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @GetMapping("/google")
    public ResponseEntity<ApiResponse<String>> googleLogin() {
        return ResponseEntity.ok(ApiResponse.success("Google OAuth2 URL initialized. Redirecting to Google Login."));
    }

    @PostMapping("/unlink-google")
    public ResponseEntity<ApiResponse<String>> unlinkGoogle(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            Optional<User> uOpt = userRepository.findByEmail(authentication.getName());
            if (uOpt.isPresent()) {
                User u = uOpt.get();
                u.setProvider(com.buildtrack.ai.auth.entity.AuthProvider.LOCAL);
                userRepository.save(u);
                return ResponseEntity.ok(ApiResponse.success("Google account unlinked successfully.", "LOCAL"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Google account unlinked.", "LOCAL"));
    }

    /**
     * Pre-validates whether a user is allowed to use "Continue with Google" login.
     *
     * Rules (all three must pass):
     *  1. The email must exist in the users table (was invited + accepted invitation).
     *  2. The user's invitation must be claimed = true (completed the invitation page).
     *  3. The user must have a RefreshToken record, meaning they have logged in via
     *     password at least once before.
     *
     * This endpoint is public (under /api/auth/**) — no JWT required.
     */
    @PostMapping("/google-eligibility")
    public ResponseEntity<Map<String, Object>> checkGoogleEligibility(
            @RequestBody Map<String, String> body
    ) {
        String email = body == null ? null : body.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "Please enter your registered email address first, then click \"Continue with Google\"."
            ));
        }

        String normalizedEmail = email.trim().toLowerCase();

        // Check 1: User must exist (was invited and accepted the invitation)
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "This email is not registered on the BuildTrack AI platform. " +
                              "You must accept your invitation and set a password before using Google login."
            ));
        }

        // Check 2: Invitation must be claimed (password was set on the invitation page)
        boolean invitationClaimed = userInvitationRepository
                .existsByEmailIgnoreCaseAndClaimed(normalizedEmail, true);
        if (!invitationClaimed) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "You have not completed your account setup yet. " +
                              "Please accept your invitation link and create a password first."
            ));
        }

        // Check 3: User must have logged in via password at least once
        // (a RefreshToken record proves a prior successful password login)
        User user = userOpt.get();
        boolean hasLoggedInBefore = refreshTokenRepository.findByUser(user).isPresent();
        if (!hasLoggedInBefore) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "You must sign in with your password at least once before using \"Continue with Google\". " +
                              "Please sign in with your email and password first."
            ));
        }

        return ResponseEntity.ok(Map.of("eligible", true));
    }

    @GetMapping("/invitations/{token}")
public ResponseEntity<ApiResponse<Object>> getInvitation(
        @PathVariable String token
) {
    return ResponseEntity.ok(
            authService.getInvitation(token)
    );
}

@PostMapping("/invitations/accept")
public ResponseEntity<ApiResponse<String>> acceptInvitation(
        @Valid @RequestBody AcceptInvitationRequest request
) {
    return ResponseEntity.ok(
            authService.acceptInvitation(request)
    );
}
}
