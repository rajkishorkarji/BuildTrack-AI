package com.buildtrack.ai.auth.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name", nullable = false, unique = true)
    private String roleName;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    public Role() {}

    public Role(Long id, String roleName, Set<Permission> permissions) {
        this.id = id;
        this.roleName = roleName;
        this.permissions = permissions != null ? permissions : new HashSet<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public Set<Permission> getPermissions() { return permissions; }
    public void setPermissions(Set<Permission> permissions) { this.permissions = permissions; }

    public static RoleBuilder builder() {
        return new RoleBuilder();
    }

    public static class RoleBuilder {
        private Long id;
        private String roleName;
        private Set<Permission> permissions = new HashSet<>();

        public RoleBuilder id(Long id) { this.id = id; return this; }
        public RoleBuilder roleName(String roleName) { this.roleName = roleName; return this; }
        public RoleBuilder permissions(Set<Permission> permissions) { this.permissions = permissions; return this; }

        public Role build() {
            Role r = new Role();
            r.id = this.id;
            r.roleName = this.roleName;
            r.permissions = this.permissions != null ? this.permissions : new HashSet<>();
            return r;
        }
    }
}
