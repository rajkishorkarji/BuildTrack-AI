package com.buildtrack.ai.auth.dto;

public record AuthDataResponse(
    String accessToken,
    String refreshToken,
    String tokenType,
    UserDto user
) {
    public AuthDataResponse(String accessToken, String refreshToken, UserDto user) {
        this(accessToken, refreshToken, "Bearer", user);
    }
}
