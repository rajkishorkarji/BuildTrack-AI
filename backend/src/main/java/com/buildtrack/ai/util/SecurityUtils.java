package com.buildtrack.ai.util;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
}