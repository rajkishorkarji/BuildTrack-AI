package com.buildtrack.ai.repository;

import com.buildtrack.ai.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    long countBySubscriptionStatus(String subscriptionStatus);

    long countByStatus(String status);
    Optional<Company> findByName(String name);
    boolean existsByName(String name);
    Optional<Company> findByCode(String code);
    boolean existsByCode(String code);
}