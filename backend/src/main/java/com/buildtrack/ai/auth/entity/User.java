package com.buildtrack.ai.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private boolean enabled;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "company_code")
    private String companyCode;

    @Column(name = "assigned_project_id")
    private Long assignedProjectId;

    @Column(name = "assigned_contractor_id")
    private Long assignedContractorId;

    @Column(name = "assigned_se_id")
    private Long assignedSeId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    public User() {}

    public User(Long id, String firstName, String lastName, String email, String phone, String password, boolean enabled, AuthProvider provider, Long companyId, LocalDateTime createdAt, LocalDateTime updatedAt, Set<Role> roles) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.enabled = enabled;
        this.provider = provider;
        this.companyId = companyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.roles = roles != null ? roles : new HashSet<>();
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (provider == null) provider = AuthProvider.LOCAL;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getFullName() {
        if (firstName == null && lastName == null) return email;
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public AuthProvider getProvider() { return provider; }
    public void setProvider(AuthProvider provider) { this.provider = provider; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyCode() { return companyCode; }
    public void setCompanyCode(String companyCode) { this.companyCode = companyCode; }

    public Long getAssignedProjectId() { return assignedProjectId; }
    public void setAssignedProjectId(Long assignedProjectId) { this.assignedProjectId = assignedProjectId; }

    public Long getAssignedContractorId() { return assignedContractorId; }
    public void setAssignedContractorId(Long assignedContractorId) { this.assignedContractorId = assignedContractorId; }

    public Long getAssignedSeId() { return assignedSeId; }
    public void setAssignedSeId(Long assignedSeId) { this.assignedSeId = assignedSeId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String password;
        private boolean enabled;
        private AuthProvider provider;
        private Long companyId;
        private String companyCode;
        private Long assignedProjectId;
        private Long assignedContractorId;
        private Long assignedSeId;
        private Set<Role> roles = new HashSet<>();

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder enabled(boolean enabled) { this.enabled = enabled; return this; }
        public UserBuilder provider(AuthProvider provider) { this.provider = provider; return this; }
        public UserBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public UserBuilder companyCode(String companyCode) { this.companyCode = companyCode; return this; }
        public UserBuilder assignedProjectId(Long assignedProjectId) { this.assignedProjectId = assignedProjectId; return this; }
        public UserBuilder assignedContractorId(Long assignedContractorId) { this.assignedContractorId = assignedContractorId; return this; }
        public UserBuilder assignedSeId(Long assignedSeId) { this.assignedSeId = assignedSeId; return this; }
        public UserBuilder roles(Set<Role> roles) { this.roles = roles; return this; }

        public User build() {
            User u = new User();
            u.id = this.id;
            u.firstName = this.firstName;
            u.lastName = this.lastName;
            u.email = this.email;
            u.phone = this.phone;
            u.password = this.password;
            u.enabled = this.enabled;
            u.provider = this.provider;
            u.companyId = this.companyId;
            u.companyCode = this.companyCode;
            u.assignedProjectId = this.assignedProjectId;
            u.assignedContractorId = this.assignedContractorId;
            u.assignedSeId = this.assignedSeId;
            u.roles = this.roles != null ? this.roles : new HashSet<>();
            return u;
        }
    }
}
