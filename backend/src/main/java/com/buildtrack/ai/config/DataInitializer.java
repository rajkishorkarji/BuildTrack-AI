package com.buildtrack.ai.config;

import com.buildtrack.ai.auth.entity.AuthProvider;
import com.buildtrack.ai.auth.entity.Role;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.repository.RoleRepository;
import com.buildtrack.ai.auth.repository.PermissionRepository;
import com.buildtrack.ai.auth.entity.Permission;
import com.buildtrack.ai.auth.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionRepository permissionRepository;

    @Value("${app.super-admin.email}")
    private String superAdminEmail;

    @Value("${app.super-admin.password}")
    private String superAdminPassword;

    public DataInitializer(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            PermissionRepository permissionRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.permissionRepository = permissionRepository;
    }

    @Override
    public void run(String... args) {

        /*
         * ============================================================
         * SUPER ADMIN INITIALIZATION
         * ============================================================
         *
         * The Super Admin is the platform-level administrator.
         *
         * Credentials come from application.properties/environment.
         *
         * No company is assigned to the Super Admin.
         */

        String email = superAdminEmail.trim().toLowerCase();

        Role superAdminRole = ensureRole("SUPER_ADMIN");
        Role companyAdminRole = ensureRole("COMPANY_ADMIN");
        Role projectManagerRole = ensureRole("PROJECT_MANAGER");
        Role siteEngineerRole = ensureRole("SITE_ENGINEER");
        Role contractorRole = ensureRole("CONTRACTOR");
        Role workerRole = ensureRole("WORKER");

        Map<String, Permission> permissions = ensurePermissions();
        applyRolePermissions(superAdminRole, permissions, Set.of(
                "DASHBOARD_VIEW","PROJECT_VIEW","PROJECT_MANAGE","TASK_VIEW","TASK_MANAGE","WORKFORCE_VIEW","WORKFORCE_MANAGE",
                "ATTENDANCE_VIEW","ATTENDANCE_MARK","SHIFT_MANAGE","EQUIPMENT_VIEW","EQUIPMENT_MANAGE","FINANCE_VIEW","FINANCE_MANAGE",
                "AI_VIEW","REPORT_VIEW","DOCUMENT_VIEW","DOCUMENT_MANAGE","DAILY_LOG_VIEW","DAILY_LOG_MANAGE","SITE_ISSUE_VIEW","SITE_ISSUE_MANAGE",
                "NOTIFICATION_VIEW","COMPANY_ADMIN_MANAGE","SYSTEM_ADMIN_MANAGE","PROFILE_EDIT"));
        applyRolePermissions(companyAdminRole, permissions, Set.of(
                "DASHBOARD_VIEW","PROJECT_VIEW","PROJECT_MANAGE","TASK_VIEW","TASK_MANAGE","WORKFORCE_VIEW","WORKFORCE_MANAGE",
                "ATTENDANCE_VIEW","ATTENDANCE_MARK","SHIFT_MANAGE","EQUIPMENT_VIEW","EQUIPMENT_MANAGE","FINANCE_VIEW","FINANCE_MANAGE",
                "AI_VIEW","REPORT_VIEW","DOCUMENT_VIEW","DOCUMENT_MANAGE","DAILY_LOG_VIEW","DAILY_LOG_MANAGE","SITE_ISSUE_VIEW","SITE_ISSUE_MANAGE",
                "NOTIFICATION_VIEW","COMPANY_ADMIN_MANAGE","PROFILE_EDIT"));
        applyRolePermissions(projectManagerRole, permissions, Set.of(
                "DASHBOARD_VIEW","PROJECT_VIEW","PROJECT_MANAGE","TASK_VIEW","TASK_MANAGE","WORKFORCE_VIEW","WORKFORCE_MANAGE",
                "ATTENDANCE_VIEW","ATTENDANCE_MARK","SHIFT_MANAGE","EQUIPMENT_VIEW","EQUIPMENT_MANAGE","FINANCE_VIEW","AI_VIEW","REPORT_VIEW",
                "DOCUMENT_VIEW","DOCUMENT_MANAGE","DAILY_LOG_VIEW","DAILY_LOG_MANAGE","SITE_ISSUE_VIEW","NOTIFICATION_VIEW","PROFILE_EDIT"));
        applyRolePermissions(siteEngineerRole, permissions, Set.of(
                "DASHBOARD_VIEW","PROJECT_VIEW","TASK_VIEW","TASK_MANAGE","WORKFORCE_VIEW","WORKFORCE_MANAGE","ATTENDANCE_VIEW","ATTENDANCE_MARK","SHIFT_MANAGE",
                "EQUIPMENT_VIEW","EQUIPMENT_MANAGE","DOCUMENT_VIEW","DOCUMENT_MANAGE","DAILY_LOG_VIEW","DAILY_LOG_MANAGE","SITE_ISSUE_VIEW","SITE_ISSUE_MANAGE","NOTIFICATION_VIEW","PROFILE_EDIT"));
        applyRolePermissions(contractorRole, permissions, Set.of(
                "DASHBOARD_VIEW","PROJECT_VIEW","TASK_VIEW","TASK_MANAGE","WORKFORCE_VIEW","WORKFORCE_MANAGE","ATTENDANCE_VIEW","ATTENDANCE_MARK","SHIFT_MANAGE",
                "FINANCE_VIEW","DOCUMENT_VIEW","DAILY_LOG_VIEW","SITE_ISSUE_VIEW","NOTIFICATION_VIEW","PROFILE_EDIT"));
        applyRolePermissions(workerRole, permissions, Set.of(
                "DASHBOARD_VIEW","PROJECT_VIEW","TASK_VIEW","TASK_MANAGE","EQUIPMENT_VIEW","WORKFORCE_VIEW","ATTENDANCE_VIEW","ATTENDANCE_MARK","DOCUMENT_VIEW",
                "NOTIFICATION_VIEW","PROFILE_EDIT"));

        if (!userRepository.existsByEmail(email)) {

            User superAdmin = User.builder()
                    .firstName("System")
                    .lastName("Master Admin")
                    .email(email)
                    .password(
                            passwordEncoder.encode(superAdminPassword)
                    )
                    .enabled(true)
                    .provider(AuthProvider.LOCAL)
                    .roles(Set.of(superAdminRole))
                    .build();

            userRepository.save(superAdmin);

            System.out.println(
                    "BuildTrack AI Super Admin initialized: " + email
            );

        } else {

            System.out.println(
                    "BuildTrack AI Super Admin already exists: " + email
            );
        }

        /*
         * ============================================================
         * DEMO DATA REMOVED
         * ============================================================
         *
         * Companies, projects, workers, equipment, finance,
         * documents and AI insights must NOT be automatically
         * created here.
         *
         * They should be created through the actual application
         * workflows.
         *
         * Super Admin
         *     ↓
         * Create Company
         *     ↓
         * Assign Company Admin
         *     ↓
         * Select Subscription
         *     ↓
         * Company Admin manages:
         *     Projects
         *     Workforce
         *     Tasks
         *     Equipment
         *     Finance
         *     Documents
         *     AI Insights
         */
    }

    private Map<String, Permission> ensurePermissions() {
        String[] names = {
                "DASHBOARD_VIEW","PROJECT_VIEW","PROJECT_MANAGE","TASK_VIEW","TASK_MANAGE","WORKFORCE_VIEW","WORKFORCE_MANAGE",
                "ATTENDANCE_VIEW","ATTENDANCE_MARK","SHIFT_MANAGE","EQUIPMENT_VIEW","EQUIPMENT_MANAGE","FINANCE_VIEW","FINANCE_MANAGE",
                "AI_VIEW","REPORT_VIEW","DOCUMENT_VIEW","DOCUMENT_MANAGE","DAILY_LOG_VIEW","DAILY_LOG_MANAGE","SITE_ISSUE_VIEW","SITE_ISSUE_MANAGE",
                "NOTIFICATION_VIEW","COMPANY_ADMIN_MANAGE","SYSTEM_ADMIN_MANAGE","PROFILE_EDIT"
        };
        return java.util.Arrays.stream(names).map(name ->
                permissionRepository.findByPermissionName(name).orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setPermissionName(name);
                    return permissionRepository.save(permission);
                })
        ).collect(Collectors.toMap(Permission::getPermissionName, p -> p));
    }

    private void applyRolePermissions(Role role, Map<String, Permission> permissions, Set<String> names) {
        role.getPermissions().clear();
        names.forEach(name -> {
            Permission permission = permissions.get(name);
            if (permission != null) role.getPermissions().add(permission);
        });
        roleRepository.save(role);
    }

    private Role ensureRole(String roleName) {
        return roleRepository.findByRoleName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setRoleName(roleName);
            return roleRepository.save(role);
        });
    }
}