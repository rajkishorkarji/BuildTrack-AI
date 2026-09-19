package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.exception.BadRequestException;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.WorkerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SubscriptionPlanService {

    public enum PlanTier {
        STARTER(5, 25, "Starter"),
        PROFESSIONAL(20, 100, "Professional"),
        ENTERPRISE(Integer.MAX_VALUE, Integer.MAX_VALUE, "Enterprise");

        private final int maxProjects;
        private final int maxWorkers;
        private final String displayName;

        PlanTier(int maxProjects, int maxWorkers, String displayName) {
            this.maxProjects = maxProjects;
            this.maxWorkers = maxWorkers;
            this.displayName = displayName;
        }

        public int getMaxProjects() {
            return maxProjects;
        }

        public int getMaxWorkers() {
            return maxWorkers;
        }

        public String getDisplayName() {
            return displayName;
        }

        public static PlanTier resolve(String plan) {
            if (plan == null || plan.isBlank()) {
                return ENTERPRISE;
            }
            String upper = plan.toUpperCase(Locale.ROOT);
            if (upper.contains("STARTER")) {
                return STARTER;
            } else if (upper.contains("PROFESSIONAL")) {
                return PROFESSIONAL;
            } else if (upper.contains("ENTERPRISE")) {
                return ENTERPRISE;
            }
            return ENTERPRISE;
        }
    }

    private final ProjectRepository projectRepository;
    private final WorkerRepository workerRepository;

    public PlanTier getPlanTier(Company company) {
        if (company == null) {
            return PlanTier.ENTERPRISE;
        }
        return PlanTier.resolve(company.getPlan());
    }

    public long getProjectCount(Long companyId) {
        if (companyId == null) return 0;
        return projectRepository.countByCompanyId(companyId);
    }

    public long getWorkerCount(Long companyId) {
        if (companyId == null) return 0;
        return workerRepository.countByCompanyId(companyId);
    }

    public void validateProjectCreationAllowed(Company company) {
        if (company == null) return;
        PlanTier tier = getPlanTier(company);
        if (tier == PlanTier.ENTERPRISE) return;

        long currentCount = projectRepository.countByCompanyId(company.getId());
        if (currentCount >= tier.getMaxProjects()) {
            String nextPlan = tier == PlanTier.STARTER ? "Professional or Enterprise" : "Enterprise";
            throw new BadRequestException(String.format(
                    "Project limit reached for your %s plan (%d of %d projects used). Please upgrade to %s to create more projects.",
                    tier.getDisplayName(), currentCount, tier.getMaxProjects(), nextPlan
            ));
        }
    }

    public void validateWorkerCreationAllowed(Company company) {
        if (company == null) return;
        PlanTier tier = getPlanTier(company);
        if (tier == PlanTier.ENTERPRISE) return;

        long currentCount = workerRepository.countByCompanyId(company.getId());
        if (currentCount >= tier.getMaxWorkers()) {
            String nextPlan = tier == PlanTier.STARTER ? "Professional or Enterprise" : "Enterprise";
            throw new BadRequestException(String.format(
                    "Worker limit reached for your %s plan (%d of %d workers registered). Please upgrade to %s to add more workers.",
                    tier.getDisplayName(), currentCount, tier.getMaxWorkers(), nextPlan
            ));
        }
    }
}
