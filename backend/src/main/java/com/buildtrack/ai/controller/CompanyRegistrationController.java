package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.auth.dto.CompanyRegistrationRequest;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.repository.CompanyRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/company-registration")
@RequiredArgsConstructor
public class CompanyRegistrationController {

    private final CompanyRepository companyRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> registerCompany(
            @Valid @RequestBody CompanyRegistrationRequest request
    ) {

        String companyName =
                request.companyName().trim();

        String companyEmail =
                request.companyEmail()
                        .trim()
                        .toLowerCase();

        if (companyRepository.existsByName(
                companyName
        )) {
            throw new IllegalArgumentException(
                    "A company with this name already exists"
            );
        }

        if (companyRepository
                .findByName(companyName)
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Company registration already exists"
            );
        }

        Company company =
                new Company();

        company.setName(companyName);
        company.setEmail(companyEmail);
        company.setPhone(request.phone());
        company.setAddress(request.address());
        company.setPlan(request.plan());

        /*
         * No admin account yet.
         *
         * Super Admin will approve the company
         * and then invite its administrator.
         */
        company.setStatus("PENDING");
        company.setSubscriptionStatus("PENDING");

        companyRepository.save(company);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Company registration submitted successfully. Our team will review your request.",
                                null
                        )
                );
    }
}