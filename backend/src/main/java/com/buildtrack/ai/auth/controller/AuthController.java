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
    private final com.buildtrack.ai.repository.CompanyRepository companyRepository;

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

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            org.springframework.security.core.Authentication authentication,
            @RequestBody Map<String, String> body
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new com.buildtrack.ai.exception.UnauthorizedException("Authenticated user was not found");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new com.buildtrack.ai.exception.ResourceNotFoundException("User not found: " + email));

        String fullName = body.get("fullName");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");

        if (fullName != null && !fullName.isBlank()) {
            String[] parts = fullName.trim().split("\\s+", 2);
            user.setFirstName(parts[0]);
            user.setLastName(parts.length > 1 ? parts[1] : "");
        } else {
            if (firstName != null) user.setFirstName(firstName.trim());
            if (lastName != null) user.setLastName(lastName.trim());
        }

        User savedUser = userRepository.save(user);

        String mainRole = savedUser.getRoles().stream().findFirst()
                .map(com.buildtrack.ai.auth.entity.Role::getRoleName).orElse("WORKER");

        String companyName = "Platform";
        if (savedUser.getCompanyId() != null) {
            companyName = companyRepository.findById(savedUser.getCompanyId())
                    .map(com.buildtrack.ai.entity.Company::getName).orElse("Platform");
        }

        String updatedFullName = (savedUser.getFirstName() != null ? savedUser.getFirstName() + " " + (savedUser.getLastName() != null ? savedUser.getLastName() : "") : "").trim();

        java.util.List<String> permissions = savedUser.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(com.buildtrack.ai.auth.entity.Permission::getPermissionName)
                .distinct()
                .collect(java.util.stream.Collectors.toList());

        UserDto userDto = new UserDto(
                savedUser.getId(),
                updatedFullName.isEmpty() ? savedUser.getEmail() : updatedFullName,
                savedUser.getEmail(),
                mainRole,
                savedUser.getCompanyId(),
                savedUser.getCompanyCode(),
                companyName,
                savedUser.getAssignedProjectId(),
                permissions,
                savedUser.getProvider() != null ? savedUser.getProvider().name() : "LOCAL"
        );

        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userDto));
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
    @org.springframework.beans.factory.annotation.Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @GetMapping("/google-config")
    public ResponseEntity<Map<String, Object>> getGoogleConfig() {
        boolean configured = googleClientId != null && !googleClientId.isBlank() && !googleClientId.contains("dummy");
        return ResponseEntity.ok(Map.of("configured", configured));
    }

    @PostMapping("/google-eligibility")
    public ResponseEntity<Map<String, Object>> checkGoogleEligibility(
            @RequestBody(required = false) Map<String, String> body
    ) {
        boolean configured = googleClientId != null && !googleClientId.isBlank() && !googleClientId.contains("dummy");
        if (!configured) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "configured", false,
                    "reason", "Google OAuth Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file."
            ));
        }

        String email = body == null ? null : body.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "eligible", true,
                    "configured", true
            ));
        }

        String normalizedEmail = email.trim().toLowerCase();

        // Check 1: User must exist in the system
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "eligible", false,
                    "reason", "This email is not registered on the BuildTrack AI platform. Please contact your company administrator to receive an invitation."
            ));
        }

        return ResponseEntity.ok(Map.of("eligible", true, "configured", true));
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
