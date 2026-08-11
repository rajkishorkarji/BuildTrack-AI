package com.buildtrack.ai.auth.service.impl;

import org.springframework.transaction.annotation.Transactional;

import com.buildtrack.ai.auth.dto.*;
import com.buildtrack.ai.auth.entity.*;
import com.buildtrack.ai.auth.repository.*;
import com.buildtrack.ai.auth.security.JwtService;
import com.buildtrack.ai.auth.service.AuthService;
import com.buildtrack.ai.auth.service.EmailService;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.repository.WorkerRepository;
import com.buildtrack.ai.entity.Worker;

import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import java.time.LocalDateTime;
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
    private final EmailService emailService;

    private final CompanyRepository companyRepository;
    private final UserInvitationRepository userInvitationRepository;
    private final WorkerRepository workerRepository;

    // ============================================================
    // VERIFY EMAIL
    // ============================================================

    @Override
    public ApiResponse<String> verifyEmail(String token) {

        EmailVerificationToken verificationToken =
                emailVerificationRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid verification token"
                                )
                        );

        if (verificationToken.getExpiryDate()
                .isBefore(Instant.now())) {

            throw new IllegalArgumentException(
                    "Verification token has expired"
            );
        }

        User user =
                verificationToken.getUser();

        user.setEnabled(true);

        userRepository.save(user);

        emailVerificationRepository.delete(
                verificationToken
        );

        return ApiResponse.success(
                "Email verified successfully. You can now sign in.",
                null
        );
    }


        // ============================================================
    // LOGIN
    // ============================================================

    @Override
    @Transactional
    public ApiResponse<AuthDataResponse> login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid Credentials"
                        )
                );

        if (!user.isEnabled()) {
            throw new DisabledException(
                    "Your account is disabled. Please verify your email."
            );
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        String mainRole = user.getRoles()
                .stream()
                .findFirst()
                .map(Role::getRoleName)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "User has no assigned role"
                        )
                );

        List<String> permissions = user.getRoles()
                .stream()
                .flatMap(
                        role -> role.getPermissions().stream()
                )
                .map(
                        Permission::getPermissionName
                )
                .distinct()
                .toList();

        Map<String, Object> extraClaims =
                new HashMap<>();

        extraClaims.put(
                "userId",
                user.getId()
        );

        extraClaims.put(
                "role",
                mainRole
        );

        extraClaims.put(
                "permissions",
                permissions
        );

        if (user.getCompanyId() != null) {
            extraClaims.put(
                    "companyId",
                    user.getCompanyId()
            );
        }

        if (user.getCompanyCode() != null) {
            extraClaims.put(
                    "companyCode",
                    user.getCompanyCode()
            );
        }

        if (user.getAssignedProjectId() != null) {
            extraClaims.put(
                    "assignedProjectId",
                    user.getAssignedProjectId()
            );
        }

        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        List.of()
                );

        String accessToken =
                jwtService.generateToken(
                        userDetails,
                        extraClaims
                );

        // Remove any existing refresh token for this user.
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken =
                RefreshToken.builder()
                        .user(user)
                        .token(UUID.randomUUID().toString())
                        .expiryDate(
                                Instant.now()
                                        .plusSeconds(
                                                7L * 24 * 60 * 60
                                        )
                        )
                        .build();

        refreshTokenRepository.save(
                refreshToken
        );

        String companyName = null;

        if (user.getCompanyId() != null) {

            companyName =
                    companyRepository
                            .findById(user.getCompanyId())
                            .map(Company::getName)
                            .orElse(null);
        }

        String fullName =
                (
                        (user.getFirstName() == null
                                ? ""
                                : user.getFirstName())
                        + " "
                        + (user.getLastName() == null
                                ? ""
                                : user.getLastName())
                ).trim();

        UserDto userDto =
                new UserDto(
                        user.getId(),
                        fullName,
                        user.getEmail(),
                        mainRole,
                        user.getCompanyId(),
                        user.getCompanyCode(),
                        companyName,
                        user.getAssignedProjectId(),
                        permissions,
                        user.getProvider() != null ? user.getProvider().name() : "LOCAL"
                );

        AuthDataResponse authData =
                new AuthDataResponse(
                        accessToken,
                        refreshToken.getToken(),
                        userDto
                );

        return ApiResponse.success(
                "Login successful",
                authData
        );
    }


    // ============================================================
    // REFRESH TOKEN
    // ============================================================

    @Override
    public ApiResponse<AuthDataResponse> refreshToken(
            RefreshTokenRequest request
    ) {

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByToken(
                                request.refreshToken()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid refresh token"
                                )
                        );


        if (refreshToken.getExpiryDate()
                .isBefore(Instant.now())) {

            refreshTokenRepository.delete(
                    refreshToken
            );

            throw new IllegalArgumentException(
                    "Refresh token has expired. Please login again."
            );
        }


        User user =
                refreshToken.getUser();


        if (!user.isEnabled()) {
            throw new DisabledException(
                    "Account is disabled."
            );
        }


        String mainRole =
                user.getRoles()
                        .stream()
                        .findFirst()
                        .map(Role::getRoleName)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "User has no assigned role"
                                )
                        );


        List<String> permissions =
                user.getRoles()
                        .stream()
                        .flatMap(
                                role -> role.getPermissions().stream()
                        )
                        .map(
                                Permission::getPermissionName
                        )
                        .distinct()
                        .toList();


        Map<String, Object> extraClaims =
                new HashMap<>();

        extraClaims.put(
                "userId",
                user.getId()
        );

        extraClaims.put(
                "role",
                mainRole
        );

        extraClaims.put(
                "permissions",
                permissions
        );

        if (user.getCompanyId() != null) {
            extraClaims.put(
                    "companyId",
                    user.getCompanyId()
            );
        }

        if (user.getCompanyCode() != null) {
            extraClaims.put(
                    "companyCode",
                    user.getCompanyCode()
            );
        }

        if (user.getAssignedProjectId() != null) {
            extraClaims.put(
                    "assignedProjectId",
                    user.getAssignedProjectId()
            );
        }


        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        List.of()
                );


        String newAccessToken =
                jwtService.generateToken(
                        userDetails,
                        extraClaims
                );


        String companyName = null;

        if (user.getCompanyId() != null) {
            companyName =
                    companyRepository
                            .findById(user.getCompanyId())
                            .map(Company::getName)
                            .orElse(null);
        }


        String fullName =
                ((user.getFirstName() == null
                        ? ""
                        : user.getFirstName())
                        + " "
                        + (user.getLastName() == null
                        ? ""
                        : user.getLastName()))
                        .trim();


        UserDto userDto =
                new UserDto(
                        user.getId(),
                        fullName,
                        user.getEmail(),
                        mainRole,
                        user.getCompanyId(),
                        user.getCompanyCode(),
                        companyName,
                        user.getAssignedProjectId(),
                        permissions,
                        user.getProvider() != null ? user.getProvider().name() : "LOCAL"
                );


        return ApiResponse.success(
                "Token refreshed successfully",
                new AuthDataResponse(
                        newAccessToken,
                        refreshToken.getToken(),
                        userDto
                )
        );
    }


    // ============================================================
    // LOGOUT
    // ============================================================

    @Override
    public ApiResponse logout(
            String refreshToken
    ) {

        refreshTokenRepository
                .findByToken(refreshToken)
                .ifPresent(
                        refreshTokenRepository::delete
                );

        return ApiResponse.success(
                "Logout successful"
        );
    }


    // ============================================================
    // FORGOT PASSWORD
    // ============================================================

    @Override
    public ApiResponse<String> forgotPassword(
            ForgotPasswordRequest request
    ) {

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        /*
         * Do not reveal whether an email exists.
         */
        userRepository.findByEmail(email)
                .ifPresent(user -> {

                    String token =
                            UUID.randomUUID().toString();

                    PasswordResetToken resetToken =
                            PasswordResetToken.builder()
                                    .token(token)
                                    .user(user)
                                    .expiryDate(
                                            Instant.now()
                                                    .plusSeconds(3600)
                                    )
                                    .build();

                    passwordResetRepository.save(
                            resetToken
                    );

                    emailService.sendPasswordResetEmail(
                            user.getEmail(),
                            token
                    );
                });

        return ApiResponse.success(
                "If an account exists for this email, a password reset link has been sent.",
                null
        );
    }


    // ============================================================
    // RESET PASSWORD
    // ============================================================

    @Override
    public ApiResponse resetPassword(
            ResetPasswordRequest request
    ) {

        PasswordResetToken resetToken =
                passwordResetRepository
                        .findByToken(
                                request.token()
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid reset token"
                                )
                        );


        if (resetToken.getExpiryDate()
                .isBefore(Instant.now())) {

            passwordResetRepository.delete(
                    resetToken
            );

            throw new IllegalArgumentException(
                    "Reset token has expired"
            );
        }


        User user =
                resetToken.getUser();

        user.setPassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.save(user);

        passwordResetRepository.delete(
                resetToken
        );

        return ApiResponse.success(
                "Password reset successfully. You can now sign in."
        );
    }

    @Override
@Transactional(readOnly = true)
public ApiResponse<Object> getInvitation(
        String token
) {

    UserInvitation invitation =
            userInvitationRepository
                    .findByToken(token)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Invalid invitation"
                            )
                    );

    if (invitation.isClaimed()) {
        throw new IllegalArgumentException(
                "This invitation has already been used"
        );
    }

    if (invitation.getExpiresAt()
            .isBefore(LocalDateTime.now())) {

        throw new IllegalArgumentException(
                "This invitation has expired"
        );
    }

    Company company =
            companyRepository
                    .findById(invitation.getCompanyId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Company no longer exists"
                            )
                    );

    Map<String, Object> data =
            new HashMap<>();

    data.put(
            "fullName",
            invitation.getFullName()
    );

    data.put(
            "email",
            invitation.getEmail()
    );

    data.put(
            "role",
            invitation.getRole()
    );

    data.put(
            "companyName",
            company.getName()
    );

    data.put(
            "expiresAt",
            invitation.getExpiresAt()
    );

    return ApiResponse.success(
            "Invitation is valid",
            data
    );
}

@Override
@Transactional
public ApiResponse<String> acceptInvitation(AcceptInvitationRequest request) {
    if (!request.password().equals(request.confirmPassword())) {
        throw new IllegalArgumentException("Passwords do not match");
    }

    UserInvitation invitation = userInvitationRepository.findByToken(request.token())
            .orElseThrow(() -> new IllegalArgumentException("Invalid invitation"));

    if (invitation.isClaimed()) {
        throw new IllegalArgumentException("This invitation has already been used");
    }
    if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
        throw new IllegalArgumentException("This invitation has expired");
    }

    Company company = companyRepository.findById(invitation.getCompanyId())
            .orElseThrow(() -> new IllegalArgumentException("Company no longer exists"));
    if (!"ACTIVE".equalsIgnoreCase(company.getStatus())) {
        throw new IllegalArgumentException("This company is not active");
    }

    Role role = roleRepository.findByRoleName(invitation.getRole())
            .orElseThrow(() -> new IllegalArgumentException("Role is not configured: " + invitation.getRole()));

    User user = userRepository.findByEmail(invitation.getEmail()).orElse(null);
    if (user == null) {
        String[] parts = invitation.getFullName().trim().split("\\s+", 2);
        user = User.builder()
                .firstName(parts[0])
                .lastName(parts.length > 1 ? parts[1] : "")
                .email(invitation.getEmail())
                .password(passwordEncoder.encode(request.password()))
                .enabled(true)
                .provider(AuthProvider.LOCAL)
                .companyId(company.getId())
                .companyCode(company.getCode())
                .roles(Set.of(role))
                .build();
    } else {
        if (!company.getId().equals(user.getCompanyId()) || user.getRoles().stream().noneMatch(r -> r.getRoleName().equalsIgnoreCase(invitation.getRole()))) {
            throw new IllegalArgumentException("Invitation does not match the existing account");
        }
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
    }

    userRepository.save(user);
    invitation.setClaimed(true);
    userInvitationRepository.save(invitation);

    return ApiResponse.success("Invitation accepted successfully. You can now sign in.");
}
}
