package com.buildtrack.ai.auth.repository;

import com.buildtrack.ai.auth.entity.UserInvitation;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserInvitationRepository extends JpaRepository<UserInvitation, Long> {
    Optional<UserInvitation> findByEmailIgnoreCaseAndCompanyId(String email, Long companyId);
}
