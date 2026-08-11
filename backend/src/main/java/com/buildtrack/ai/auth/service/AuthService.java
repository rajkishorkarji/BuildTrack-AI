package com.buildtrack.ai.auth.service;

import com.buildtrack.ai.auth.dto.*;

public interface AuthService {

    ApiResponse<String> verifyEmail(
            String token
    );

    ApiResponse<AuthDataResponse> login(
            LoginRequest request
    );

    ApiResponse<AuthDataResponse> refreshToken(
            RefreshTokenRequest request
    );

    ApiResponse<Void> logout(
            String refreshToken
    );

    ApiResponse<String> forgotPassword(
            ForgotPasswordRequest request
    );

    ApiResponse<Void> resetPassword(
            ResetPasswordRequest request
    );

    ApiResponse<Object> getInvitation(
            String token
    );

    ApiResponse<String> acceptInvitation(
            AcceptInvitationRequest request
    );
}