package com.buildtrack.ai.service;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.exception.UnauthorizedException;
import com.buildtrack.ai.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantAccessService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user was not found"));
    }

    public boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> "SUPER_ADMIN".equalsIgnoreCase(role.getRoleName()));
    }

    public boolean hasRole(User user, String role) {
        return user.getRoles().stream().anyMatch(item -> role.equalsIgnoreCase(item.getRoleName()));
    }

    public Company currentCompany() {
        User user = currentUser();
        if (user.getCompanyId() == null) throw new UnauthorizedException("This account is not assigned to a tenant");
        return companyRepository.findById(user.getCompanyId())
                .orElseThrow(() -> new UnauthorizedException("Tenant was not found"));
    }

    public void requireCompanyAdmin(User user) {
        if (!hasRole(user, "COMPANY_ADMIN")) throw new UnauthorizedException("Only Company Admins can perform this action");
    }

    public void requireSuperAdmin(User user) {
        if (!isSuperAdmin(user)) throw new UnauthorizedException("Only Super Admins can perform this action");
    }

    public void requireActiveSubscription(Company company) {
        if (!"ACTIVE".equalsIgnoreCase(company.getSubscriptionStatus())) {
            throw new IllegalStateException("Activate the assigned subscription plan before creating or changing company data");
        }
    }
}
