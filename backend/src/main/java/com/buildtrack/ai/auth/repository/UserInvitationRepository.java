package com.buildtrack.ai.auth.repository;

import com.buildtrack.ai.auth.entity.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserInvitationRepository
        extends JpaRepository<UserInvitation, Long> {

    Optional<UserInvitation>
    findByEmailIgnoreCaseAndCompanyId(
            String email,
            Long companyId
    );

    Optional<UserInvitation>
    findByToken(String token);

    List<UserInvitation> findAllByCompanyIdOrderByCreatedAtDesc(
        Long companyId
);
}