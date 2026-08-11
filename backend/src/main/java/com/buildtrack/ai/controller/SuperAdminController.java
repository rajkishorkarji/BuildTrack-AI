package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.dto.CompanyAdminInviteRequest;
import com.buildtrack.ai.auth.entity.AuthProvider;
import com.buildtrack.ai.auth.entity.Role;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.entity.UserInvitation;
import com.buildtrack.ai.auth.repository.RoleRepository;
import com.buildtrack.ai.auth.repository.UserInvitationRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.auth.service.EmailService;
import com.buildtrack.ai.dto.company.CreateCompanyRequest;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.service.RealtimePublisher;
import com.buildtrack.ai.service.TenantAccessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final PasswordEncoder passwordEncoder;
    private final CompanyRepository companyRepository;
    private final RealtimePublisher realtimePublisher;
    private final TenantAccessService tenantAccessService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserInvitationRepository userInvitationRepository;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompanies() {
        tenantAccessService.requireSuperAdmin(tenantAccessService.currentUser());
        long count = companyRepository.count();
        Map<String, Object> res = new HashMap<>();
        res.put("totalCompanies", count);
        res.put("activeSubscriptions", companyRepository.countBySubscriptionStatus("ACTIVE"));
        res.put("activeCompanies", companyRepository.countByStatus("ACTIVE"));
        res.put("serverStatus", "HEALTHY");
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/companies")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> createCompany(
            @Valid @RequestBody CreateCompanyRequest request
    ) {

    tenantAccessService.requireSuperAdmin(
            tenantAccessService.currentUser()
    );

    String companyName =
            request.companyName().trim();

    String companyEmail =
            request.companyEmail().trim().toLowerCase();

    String adminEmail =
            request.adminEmail().trim().toLowerCase();

    if (companyRepository.existsByName(companyName)) {
        throw new IllegalArgumentException(
                "A company with this name already exists"
        );
    }

    if (userRepository.existsByEmail(adminEmail)) {
        throw new IllegalArgumentException(
                "A user already exists with this admin email"
        );
    }

    String companyCode =
            request.companyCode() == null ||
            request.companyCode().isBlank()
                    ? generateCompanyCode(companyName)
                    : request.companyCode()
                            .trim()
                            .toUpperCase();

    if (companyRepository.existsByCode(companyCode)) {
        throw new IllegalArgumentException(
                "Company code is already in use"
        );
    }

    Company company = new Company();

    company.setName(companyName);
    company.setEmail(companyEmail);
    company.setPhone(request.phone());
    company.setAddress(request.address());
    company.setCode(companyCode);
    company.setPlan(request.plan());

    company.setAdminName(
            request.adminFirstName()
                    + " "
                    + request.adminLastName()
    );

    company.setAdminEmail(adminEmail);

    /*
     * The company has been approved because the
     * Super Admin created it directly.
     *
     * Subscription remains PENDING until activated.
     */
    company.setStatus("ACTIVE");
    company.setSubscriptionStatus("PENDING");

    Company savedCompany =
            companyRepository.save(company);

    Role companyAdminRole =
            roleRepository
                    .findByRoleName("COMPANY_ADMIN")
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "COMPANY_ADMIN role is not configured"
                            )
                    );

    /*
     * Create the Company Admin account without
     * giving the Super Admin a password field.
     *
     * A temporary random password is stored only
     * as a BCrypt hash and the account remains disabled.
     */
    String temporaryPassword =
            UUID.randomUUID().toString();

    User admin =
            User.builder()
                    .firstName(
                            request.adminFirstName()
                    )
                    .lastName(
                            request.adminLastName()
                    )
                    .email(adminEmail)
                    .password(
                            passwordEncoder.encode(
                                    temporaryPassword
                            )
                    )
                    .enabled(false)
                    .provider(AuthProvider.LOCAL)
                    .companyId(savedCompany.getId())
                    .companyCode(savedCompany.getCode())
                    .roles(
                            java.util.Set.of(
                                    companyAdminRole
                            )
                    )
                    .build();

    userRepository.save(admin);

    /*
     * Generate invitation.
     */
    String token =
            UUID.randomUUID().toString();

    UserInvitation invitation =
            userInvitationRepository
                    .findByEmailIgnoreCaseAndCompanyId(
                            adminEmail,
                            savedCompany.getId()
                    )
                    .orElseGet(
                            UserInvitation::new
                    );

    invitation.setFullName(
            request.adminFirstName()
                    + " "
                    + request.adminLastName()
    );

    invitation.setEmail(adminEmail);
    invitation.setRole("COMPANY_ADMIN");
    invitation.setCompanyId(savedCompany.getId());
    invitation.setToken(token);
    invitation.setClaimed(false);
    invitation.setExpiresAt(
            LocalDateTime.now().plusHours(24)
    );

    userInvitationRepository.save(
            invitation
    );

    /*
     * Send invitation email.
     */
    emailService.sendCompanyAdminInvitation(
            adminEmail,
            invitation.getFullName(),
            savedCompany.getName(),
            token
    );

    realtimePublisher.publish(
            "companies",
            "created",
            savedCompany.getId()
    );

    String invitationUrl = frontendUrl + "/accept-invitation?token=" + token;
    Map<String, Object> result = new HashMap<>();
    result.put("id", savedCompany.getId());
    result.put("name", savedCompany.getName());
    result.put("code", savedCompany.getCode());
    result.put("email", savedCompany.getEmail());
    result.put("adminEmail", savedCompany.getAdminEmail());
    result.put("adminName", savedCompany.getAdminName());
    result.put("plan", savedCompany.getPlan());
    result.put("status", savedCompany.getStatus());
    result.put("subscriptionStatus", savedCompany.getSubscriptionStatus());
    result.put("createdAt", savedCompany.getCreatedAt());
    result.put("invitationUrl", invitationUrl);

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Company created successfully. Company Admin invitation generated.",
                    result
            )
    );
}

private String generateCompanyCode(
        String companyName
) {

    String prefix =
            companyName
                    .replaceAll(
                            "[^A-Za-z0-9]",
                            ""
                    )
                    .toUpperCase();

    prefix =
            prefix.length() >= 4
                    ? prefix.substring(0, 4)
                    : prefix;

    String code;

    do {
        code =
                prefix
                        + "-"
                        + UUID.randomUUID()
                                .toString()
                                .substring(0, 4)
                                .toUpperCase();
    } while (
            companyRepository.existsByCode(code)
    );

    return code;
}

    @GetMapping("/companies/all")
    public ResponseEntity<ApiResponse<java.util.List<Company>>> getAllCompanies() {
        tenantAccessService.requireSuperAdmin(tenantAccessService.currentUser());
        return ResponseEntity.ok(ApiResponse.success(companyRepository.findAll()));
    }

    @DeleteMapping("/companies/{identifier}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteCompany(@PathVariable String identifier) {
        tenantAccessService.requireSuperAdmin(tenantAccessService.currentUser());
        Company company = null;
        try {
            Long id = Long.parseLong(identifier);
            company = companyRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            company = companyRepository.findByName(identifier)
                    .orElseGet(() -> companyRepository.findByCode(identifier).orElse(null));
        }

        if (company != null) {
            Long companyId = company.getId();
            java.util.List<User> companyUsers = userRepository.findAll().stream()
                    .filter(u -> companyId.equals(u.getCompanyId()))
                    .collect(java.util.stream.Collectors.toList());
            if (!companyUsers.isEmpty()) {
                userRepository.deleteAll(companyUsers);
            }
            companyRepository.delete(company);
            realtimePublisher.publish("companies", "deleted", companyId);
        }
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Company " + identifier + " deleted.");
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PatchMapping("/companies/{identifier}/status")
    @Transactional
    public ResponseEntity<ApiResponse<Company>> updateCompanyStatus(@PathVariable String identifier, @RequestBody Map<String, String> body) {
        tenantAccessService.requireSuperAdmin(tenantAccessService.currentUser());
        Company company = null;
        try {
            Long id = Long.parseLong(identifier);
            company = companyRepository.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            company = companyRepository.findByName(identifier)
                    .orElseGet(() -> companyRepository.findByCode(identifier).orElse(null));
        }
        if (company == null) {
            throw new IllegalArgumentException("Company not found: " + identifier);
        }
        company.setStatus(body.getOrDefault("status", company.getStatus()));
        Company saved = companyRepository.save(company);
        realtimePublisher.publish("companies", "updated", saved.getId());
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PatchMapping("/companies/{id}/approve")
@Transactional
public ResponseEntity<ApiResponse<Company>> approveCompany(
        @PathVariable Long id,
        @Valid @RequestBody CompanyAdminInviteRequest request
) {

    tenantAccessService.requireSuperAdmin(
            tenantAccessService.currentUser()
    );

    Company company =
            companyRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Company not found"
                            )
                    );

    if (!"PENDING".equalsIgnoreCase(
            company.getStatus()
    )) {
        throw new IllegalArgumentException(
                "Company is not pending approval"
        );
    }

    String adminEmail =
            request.email()
                    .trim()
                    .toLowerCase();

    if (userRepository.existsByEmail(adminEmail)) {
        throw new IllegalArgumentException(
                "A user already exists with this email"
        );
    }

    company.setAdminName(
            request.firstName()
                    + " "
                    + request.lastName()
    );

    company.setAdminEmail(adminEmail);
    company.setStatus("ACTIVE");
    company.setSubscriptionStatus("ACTIVE");

    Company savedCompany =
            companyRepository.save(company);

    Role companyAdminRole =
            roleRepository
                    .findByRoleName("COMPANY_ADMIN")
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "COMPANY_ADMIN role is not configured"
                            )
                    );

    String temporaryPassword =
            UUID.randomUUID().toString();

    User admin =
            User.builder()
                    .firstName(
                            request.firstName()
                    )
                    .lastName(
                            request.lastName()
                    )
                    .email(adminEmail)
                    .password(
                            passwordEncoder.encode(
                                    temporaryPassword
                            )
                    )
                    .enabled(false)
                    .provider(AuthProvider.LOCAL)
                    .companyId(savedCompany.getId())
                    .companyCode(savedCompany.getCode())
                    .roles(
                            java.util.Set.of(
                                    companyAdminRole
                            )
                    )
                    .build();

    userRepository.save(admin);

    String token =
            UUID.randomUUID().toString();

    UserInvitation invitation =
            new UserInvitation();

    invitation.setFullName(
            request.firstName()
                    + " "
                    + request.lastName()
    );

    invitation.setEmail(adminEmail);
    invitation.setRole("COMPANY_ADMIN");
    invitation.setCompanyId(savedCompany.getId());
    invitation.setToken(token);
    invitation.setClaimed(false);
    invitation.setExpiresAt(
            LocalDateTime.now().plusHours(24)
    );

    userInvitationRepository.save(
            invitation
    );

    emailService.sendCompanyAdminInvitation(
            adminEmail,
            invitation.getFullName(),
            savedCompany.getName(),
            token
    );

    realtimePublisher.publish(
            "companies",
            "approved",
            savedCompany.getId()
    );

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Company approved and Company Admin invitation sent.",
                    savedCompany
            )
    );
}
}
