package com.buildtrack.ai.auth.repository;

import com.buildtrack.ai.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByCompanyId(Long companyId);
    List<User> findByCompanyIdAndEnabledTrue(Long companyId);

    @Query("select distinct u from User u join u.roles r where u.companyId = :companyId and u.enabled = true and upper(r.roleName) = upper(:role)")
    List<User> findEnabledByCompanyAndRole(@Param("companyId") Long companyId, @Param("role") String role);
}
