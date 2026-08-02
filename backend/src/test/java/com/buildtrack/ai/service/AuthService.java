package com.buildtrack.ai.service;

import com.buildtrack.ai.dto.auth.AuthResponse;
import com.buildtrack.ai.dto.auth.LoginRequest;
import com.buildtrack.ai.dto.auth.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}