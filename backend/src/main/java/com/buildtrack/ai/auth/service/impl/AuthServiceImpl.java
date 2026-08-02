package com.buildtrack.ai.auth.service.impl;

import com.buildtrack.ai.auth.dto.*;
import com.buildtrack.ai.auth.entity.*;
import com.buildtrack.ai.auth.repository.*;
import com.buildtrack.ai.auth.security.JwtService;
import com.buildtrack.ai.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public ApiResponse<String> register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role userRole = roleRepository.findByRoleName(request.role().toUpperCase())
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(request.role().toUpperCase()).build()));

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .enabled(false) // Mandatory verification flow
                .provider(AuthProvider.LOCAL)
                .roles(Set.of(userRole))
                .build();

        User savedUser = userRepository.save(user);

        // Generate Verification Token
        String tokenString = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(tokenString)
                .user(savedUser)
                .expiryDate(Instant.now().plusSeconds(86400)) // 24 Hours
                .build();

        emailVerificationRepository.save(verificationToken);

        return ApiResponse.success("Registration Successful. Please check your email to verify your account.", tokenString);
    }

    @Override
    public ApiResponse<String> verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (verificationToken.getExpiryDate().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);
        emailVerificationRepository.delete(verificationToken);

        return ApiResponse.success("Email verified successfully. Account is now active.");
    }

    @Override
    public ApiResponse<AuthDataResponse> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid Credentials"));

        if (!user.isEnabled()) {
            throw new DisabledException("Account disabled. Please verify your email first.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        String mainRole = user.getRoles().stream().findFirst().map(Role::getRoleName).orElse("WORKER");
        List<String> permissions = user.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(Permission::getPermissionName)
                .toList();

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", mainRole);
        extraClaims.put("permissions", permissions);

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), List.of());

        String accessToken = jwtService.generateToken(userDetails, extraClaims);

        // Refresh Token (7 Days Expiry)
        refreshTokenRepository.deleteByUser(user);
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusSeconds(7 * 24 * 3600))
                .build();
        refreshTokenRepository.save(refreshToken);

        UserDto userDto = new UserDto(user.getId(), user.getFirstName() + " " + user.getLastName(), user.getEmail(), mainRole, permissions);
        AuthDataResponse authData = new AuthDataResponse(accessToken, refreshToken.getToken(), userDto);

        return ApiResponse.success("Login Successful", authData);
    }

    @Override
    public ApiResponse<AuthDataResponse> refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new IllegalArgumentException("Refresh token has expired. Please login again.");
        }

        User user = refreshToken.getUser();
        String mainRole = user.getRoles().stream().findFirst().map(Role::getRoleName).orElse("WORKER");

        org.springframework.security.core.userdetails.User userDetails =
                new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), List.of());

        String newAccessToken = jwtService.generateToken(userDetails, Map.of("userId", user.getId(), "role", mainRole));
        UserDto userDto = new UserDto(user.getId(), user.getFirstName() + " " + user.getLastName(), user.getEmail(), mainRole, List.of());

        return ApiResponse.success("Token Refreshed Successfully", new AuthDataResponse(newAccessToken, refreshToken.getToken(), userDto));
    }

    @Override
    public ApiResponse<Void> logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
        return ApiResponse.success("Logout Successful");
    }

    @Override
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("No user found with email " + request.email()));

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plusSeconds(3600)) // 1 Hour
                .build();

        passwordResetRepository.save(resetToken);
        return ApiResponse.success("Password reset link sent to email.", token);
    }

    @Override
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetRepository.findByToken(request.token())
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        passwordResetRepository.delete(resetToken);

        return ApiResponse.success("Password reset successfully. You can now login.");
    }
}
