package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.dto.PersonnelInviteRequest;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.entity.UserInvitation;
import com.buildtrack.ai.auth.repository.UserInvitationRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import com.buildtrack.ai.auth.service.EmailService;
import com.buildtrack.ai.dto.project.ProjectCreateRequest;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.service.TenantAccessService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY_ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class CompanyAdminController {

    /**
     * Roles that a Company Admin is allowed to invite.
     *
     * COMPANY_ADMIN and SUPER_ADMIN are intentionally excluded.
     */
    private static final List<String> INVITABLE_ROLES = List.of(
            "PROJECT_MANAGER",
            "SITE_ENGINEER",
            "CONTRACTOR",
            "WORKER"
    );

    /**
     * Invitation validity period.
     */
    private static final long INVITATION_EXPIRY_HOURS = 24;

    private final ProjectService projectService;
    private final TenantAccessService tenantAccessService;

    private final UserInvitationRepository invitationRepository;
    private final UserRepository userRepository;

    private final EmailService emailService;


    // ============================================================
    // COMPANY OVERVIEW
    // ============================================================

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompanyOverview() {

        User user = tenantAccessService.currentUser();

        tenantAccessService.requireCompanyAdmin(user);

        Company company =
                tenantAccessService.currentCompany();

        return ResponseEntity.ok(
                ApiResponse.success(
                        Map.of(
                                "companyId",
                                company.getId(),

                                "companyName",
                                company.getName(),

                                "status",
                                company.getStatus(),

                                "subscriptionStatus",
                                company.getSubscriptionStatus(),

                                "plan",
                                company.getPlan()
                        )
                )
        );
    }


    // ============================================================
    // CREATE PROJECT
    // ============================================================

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Project>> createProject(
            @Valid @RequestBody ProjectCreateRequest request
    ) {

        User user =
                tenantAccessService.currentUser();

        tenantAccessService.requireCompanyAdmin(user);

        Company company =
                tenantAccessService.currentCompany();

        /*
         * Project creation is only allowed for an
         * active subscription.
         */
        tenantAccessService.requireActiveSubscription(
                company
        );

        Project project =
                projectService.create(
                        company.getId(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(project)
                );
    }


    // ============================================================
    // PERSONNEL INVITATION
    // ============================================================

    /**
     * Invite a new Project Manager, Site Engineer,
     * Contractor or Worker.
     *
     * This endpoint also handles RESEND.
     *
     * If an invitation already exists for the same
     * email + company:
     *
     * 1. Existing invitation is reused.
     * 2. New token is generated.
     * 3. Previous token becomes invalid.
     * 4. Invitation is marked unclaimed.
     * 5. Expiry is reset to 24 hours.
     * 6. New email is sent.
     */
    @PostMapping("/personnel/invitations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> invitePersonnel(
            @Valid @RequestBody PersonnelInviteRequest request
    ) {

        // --------------------------------------------------------
        // 1. Authenticate current user
        // --------------------------------------------------------

        User inviter =
                tenantAccessService.currentUser();

        tenantAccessService.requireCompanyAdmin(
                inviter
        );


        // --------------------------------------------------------
        // 2. Resolve current company
        // --------------------------------------------------------

        Company company =
                tenantAccessService.currentCompany();


        // --------------------------------------------------------
        // 3. Verify subscription
        // --------------------------------------------------------

        tenantAccessService.requireActiveSubscription(
                company
        );


        // --------------------------------------------------------
        // 4. Normalize request
        // --------------------------------------------------------

        String fullName =
                request.fullName()
                        .trim();

        String email =
                request.email()
                        .trim()
                        .toLowerCase();

        String role =
                normalizeRole(
                        request.role()
                );


        // --------------------------------------------------------
        // 5. Validate name
        // --------------------------------------------------------

        if (fullName.isBlank()) {
            throw new IllegalArgumentException(
                    "Full name is required"
            );
        }


        // --------------------------------------------------------
        // 6. Validate role
        // --------------------------------------------------------

        if (!INVITABLE_ROLES.contains(role)) {

            throw new IllegalArgumentException(
                    "Only PROJECT_MANAGER, SITE_ENGINEER, " +
                    "CONTRACTOR and WORKER can be invited " +
                    "by Company Admin"
            );
        }


        // --------------------------------------------------------
        // 7. Validate existing account
        // --------------------------------------------------------

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "An account already exists for this email"
            );
        }


        // --------------------------------------------------------
        // 8. Find existing invitation
        // --------------------------------------------------------

        UserInvitation invitation =
                invitationRepository
                        .findByEmailIgnoreCaseAndCompanyId(
                                email,
                                company.getId()
                        )
                        .orElseGet(
                                UserInvitation::new
                        );


        boolean resend =
                invitation.getId() != null;


        // --------------------------------------------------------
        // 9. Update invitation
        // --------------------------------------------------------

        invitation.setFullName(fullName);

        invitation.setEmail(email);

        invitation.setRole(role);

        invitation.setCompanyId(
                company.getId()
        );


        // --------------------------------------------------------
        // 10. Generate secure invitation token
        // --------------------------------------------------------

        String token =
                generateInvitationToken();

        invitation.setToken(token);


        // --------------------------------------------------------
        // 11. Reset invitation state
        // --------------------------------------------------------

        invitation.setClaimed(false);

        invitation.setExpiresAt(
                LocalDateTime.now()
                        .plusHours(
                                INVITATION_EXPIRY_HOURS
                        )
        );


        // --------------------------------------------------------
        // 12. Persist invitation
        // --------------------------------------------------------

        UserInvitation savedInvitation =
                invitationRepository.save(
                        invitation
                );


        // --------------------------------------------------------
        // 13. Send email
        // --------------------------------------------------------

        try {

            emailService.sendPersonnelInvitation(
                    email,
                    fullName,
                    role,
                    company.getName(),
                    token
            );

        } catch (Exception emailException) {

            /*
             * The invitation has been saved, but email delivery
             * failed. Log it so the issue can be diagnosed.
             *
             * We intentionally do not expose internal email
             * infrastructure details to the frontend.
             */

            log.error(
                    "Failed to send personnel invitation email " +
                    "to {} for company {}",
                    email,
                    company.getId(),
                    emailException
            );

            throw new IllegalStateException(
                    "Invitation could not be sent. " +
                    "Please try again.",
                    emailException
            );
        }


        // --------------------------------------------------------
        // 14. Response
        // --------------------------------------------------------

        String message =
                resend
                        ? "Invitation resent successfully"
                        : "Invitation sent successfully";

        return ResponseEntity.ok(
                ApiResponse.success(
                        message,
                        Map.of(
                                "id",
                                savedInvitation.getId(),

                                "fullName",
                                savedInvitation.getFullName(),

                                "email",
                                savedInvitation.getEmail(),

                                "role",
                                savedInvitation.getRole(),

                                "claimed",
                                savedInvitation.isClaimed(),

                                "expiresAt",
                                savedInvitation.getExpiresAt(),

                                "resent",
                                resend
                        )
                )
        );
    }


    // ============================================================
    // LIST PERSONNEL INVITATIONS
    // ============================================================

    /**
     * Returns invitations belonging ONLY to the current
     * Company Admin's company.
     *
     * This endpoint is used by the frontend to display:
     *
     * - Pending
     * - Accepted
     * - Expired
     *
     * invitations.
     */
    @GetMapping("/personnel/invitations")
    public ResponseEntity<
            ApiResponse<List<Map<String, Object>>>
            > getPersonnelInvitations() {

        User user =
                tenantAccessService.currentUser();

        tenantAccessService.requireCompanyAdmin(
                user
        );

        Company company =
                tenantAccessService.currentCompany();

        List<UserInvitation> invitations =
        invitationRepository
                .findAllByCompanyIdOrderByCreatedAtDesc(
                        company.getId()
                );

        List<Map<String, Object>> response =
                invitations.stream()
                        .map(this::toInvitationResponse)
                        .toList();

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }


    // ============================================================
    // HELPERS
    // ============================================================

    /**
     * Normalize role values coming from the frontend.
     *
     * Examples:
     *
     * "Project Manager"
     *      -> PROJECT_MANAGER
     *
     * " project_manager "
     *      -> PROJECT_MANAGER
     */
    private String normalizeRole(String role) {

        if (role == null) {
            return "";
        }

        return role
                .trim()
                .toUpperCase()
                .replace(' ', '_');
    }


    /**
     * Generate a new invitation token.
     *
     * Every resend receives a NEW token.
     */
    private String generateInvitationToken() {

        return UUID.randomUUID()
                .toString()
                .replace("-", "");
    }


    /**
     * Convert invitation entity to a safe API response.
     *
     * IMPORTANT:
     * Never return the invitation token to the frontend.
     */
    private Map<String, Object> toInvitationResponse(
            UserInvitation invitation
    ) {

        return Map.of(
                "id",
                invitation.getId(),

                "fullName",
                invitation.getFullName(),

                "email",
                invitation.getEmail(),

                "role",
                invitation.getRole(),

                "claimed",
                invitation.isClaimed(),

                "expiresAt",
                invitation.getExpiresAt()
        );
    }
}