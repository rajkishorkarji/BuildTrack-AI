package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.*;
import com.buildtrack.ai.repository.*;
import com.buildtrack.ai.service.AiInsightService;
import com.buildtrack.ai.service.TenantAccessService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiInsightServiceImpl implements AiInsightService {

    private final AiInsightRepository aiInsightRepository;
    private final ObjectMapper objectMapper;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final TaskRepository taskRepository;
    private final WorkerRepository workerRepository;
    private final AttendanceRepository attendanceRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaterialRepository materialRepository;
    private final TenantAccessService tenantAccessService;

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getVisibleInsights(User user, Long projectId) {
        requireAiAccess(user);
        List<AiInsight> insights;

        if (tenantAccessService.isSuperAdmin(user)) {
            insights = projectId == null
                    ? aiInsightRepository.findAllByOrderByCreatedAtDesc()
                    : aiInsightRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        } else {
            Long companyId = requireCompanyId(user);
            if (projectId != null) {
                Project project = requireVisibleProject(projectId, user);
                insights = aiInsightRepository.findByProjectIdOrderByCreatedAtDesc(project.getId());
            } else {
                insights = aiInsightRepository.findByProjectCompanyIdOrderByCreatedAtDesc(companyId);
            }
        }

        return insights.stream().map(this::toMap).toList();
    }

    @Override
    @Transactional
    public Map<String, Object> runProjectDiagnostics(Long projectId, User user) {
        requireAiAccess(user);
        Project project = requireVisibleProject(projectId, user);

        double budget = project.getBudget() == null ? 0D : project.getBudget().doubleValue();
        double spent = project.getSpent() == null ? 0D : project.getSpent().doubleValue();
        double progress = project.getProgressPercentage() == null ? 0D : project.getProgressPercentage();

        List<TaskEntity> tasks = taskRepository.findByProjectId(projectId);
        long openTasks = tasks.stream().filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus()))
                .count();

        List<ProjectAssignment> assignments = projectAssignmentRepository.findAssignments(projectId, "ACTIVE");
        long activeWorkers = assignments.stream()
                .filter(a -> "WORKER".equalsIgnoreCase(a.getAssignmentRole()))
                .count();

        long equipmentIssues = equipmentRepository.findByProjectId(projectId).stream()
        .filter(e -> e.getStatus() != null &&
                ("IN_MAINTENANCE".equalsIgnoreCase(e.getStatus().name()) ||
                 "DECOMMISSIONED".equalsIgnoreCase(e.getStatus().name())))
        .count();
        long lowStockMaterials = materialRepository.findByProjectIdOrderByNameAsc(projectId).stream()
                .filter(m -> {
                    BigDecimal q = m.getQuantity() == null ? BigDecimal.ZERO : m.getQuantity();
                    BigDecimal r = m.getReorderLevel() == null ? BigDecimal.ZERO : m.getReorderLevel();
                    return q.compareTo(r) <= 0;
                }).count();

        Map<String, Object> cost = runInference(budget, spent, progress);
        Map<String, Object> delay = predictDelay(project, tasks, activeWorkers, overdueTasks);

        double costRisk = number(cost.get("overrun_percentage"));
        double delayRisk = number(delay.get("risk_score"));
        double operationalRisk = Math.min(100D,
                overdueTasks * 12D + equipmentIssues * 15D + lowStockMaterials * 8D);
        double overall = Math.min(100D, costRisk * 0.45D + delayRisk * 0.40D + operationalRisk * 0.15D);

        String overallLevel = riskLevel(overall);
        String recommendation = buildRecommendation(cost, delay, overdueTasks, equipmentIssues, lowStockMaterials);

        AiInsight insight = aiInsightRepository.save(AiInsight.builder()
                .project(project)
                .insightType("PROJECT_HEALTH")
                .riskLevel(toEntityRisk(overallLevel))
                .riskScore(BigDecimal.valueOf(round(overall)))
                .recommendation(recommendation)
                .build());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("projectId", projectId);
        result.put("projectName", project.getName());
        result.put("overallRiskScore", round(overall));
        result.put("overallRiskLevel", overallLevel);
        result.put("cost", cost);
        result.put("delay", delay);
        result.put("operational", Map.of(
                "openTasks", openTasks,
                "overdueTasks", overdueTasks,
                "activeWorkers", activeWorkers,
                "equipmentIssues", equipmentIssues,
                "lowStockMaterials", lowStockMaterials
        ));
        result.put("recommendation", recommendation);
        result.put("insightId", insight.getId());
        result.put("createdAt", insight.getCreatedAt());
        return result;
    }

    @Override
    public Map<String, Object> runInference(Double budget, Double spent, Double progress) {
        double b = budget == null ? 0D : Math.max(0D, budget);
        double s = spent == null ? 0D : Math.max(0D, spent);
        double p = progress == null ? 0D : Math.min(100D, Math.max(0D, progress));

        if (b <= 0D) {
            return Map.of(
                    "status", "insufficient_data",
                    "message", "Project budget must be greater than zero."
            );
        }

        Map<String, Object> python = executePython("ai-ml/inference/predict_cost_overrun.py",
                List.of(String.valueOf(b), String.valueOf(s), String.valueOf(Math.max(p, 0.1D))));
        if (python != null && "success".equalsIgnoreCase(String.valueOf(python.get("status")))) {
            python.put("executionMode", "PYTHON_MODEL");
            return python;
        }

        double projected = p <= 0.1D ? s : (s / p) * 100D;
        double overrun = projected - b;
        double overrunPct = b > 0D ? (overrun / b) * 100D : 0D;

        Map<String, Object> fallback = new LinkedHashMap<>();
        fallback.put("status", "success");
        fallback.put("budget", b);
        fallback.put("spent_amount", s);
        fallback.put("progress_pct", p);
        fallback.put("projected_final_cost", round(projected));
        fallback.put("projected_overrun_amount", round(Math.max(0D, overrun)));
        fallback.put("overrun_percentage", round(Math.max(0D, overrunPct)));
        fallback.put("risk_level", riskLevel(Math.max(0D, overrunPct)));
        fallback.put("recommendation", "Review project burn rate against completed work and remaining scope.");
        fallback.put("executionMode", "JAVA_FALLBACK");
        return fallback;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> matchWorkers(Long projectId, String skill, User user) {
        requireAiAccess(user);
        Project project = requireVisibleProject(projectId, user);
        List<ProjectAssignment> assignments = projectAssignmentRepository.findAssignments(project.getId(), "ACTIVE");

        List<Map<String, Object>> candidates = new ArrayList<>();
        for (ProjectAssignment assignment : assignments) {
            if (!"WORKER".equalsIgnoreCase(assignment.getAssignmentRole())) continue;
            User candidate = assignment.getUser();
            Worker worker = workerRepository.findByUserId(candidate.getId()).orElse(null);
            if (worker == null) continue;

            String workerSkill = worker.getSkillTrade() == null ? "" : worker.getSkillTrade();
            double score = 50D;
            if (skill != null && !skill.isBlank() && workerSkill.equalsIgnoreCase(skill.trim())) score += 40D;
            if (worker.getStatus() == Worker.WorkerStatus.ACTIVE) score += 10D;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("workerId", worker.getId());
            row.put("userId", candidate.getId());
            row.put("fullName", worker.getFullName());
            row.put("skillTrade", workerSkill);
            row.put("status", worker.getStatus().name());
            row.put("matchScore", Math.min(100D, score));
            row.put("suitability", score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : "MODERATE");
            candidates.add(row);
        }

        candidates.sort((a, b) -> Double.compare(
                number(b.get("matchScore")), number(a.get("matchScore"))));

        try {
            Path temp = Files.createTempFile("buildtrack-workers-", ".json");
            Files.writeString(temp, objectMapper.writeValueAsString(candidates.stream().map(row -> {
                Map<String, Object> w = new LinkedHashMap<>();
                w.put("id", row.get("workerId"));
                w.put("user_id", row.get("userId"));
                w.put("full_name", row.get("fullName"));
                w.put("skill_trade", row.get("skillTrade"));
                w.put("status", row.get("status"));
                return w;
            }).toList()), StandardCharsets.UTF_8);

            Map<String, Object> python = executePython(
                    "ai-ml/inference/predict_worker_match.py",
                    List.of(skill == null ? "" : skill, temp.toString()));

            Files.deleteIfExists(temp);

            if (python != null && "success".equalsIgnoreCase(String.valueOf(python.get("status")))) {
                Object recommendations = python.get("recommendations");
                if (recommendations instanceof List<?> list) {
                    List<Map<String, Object>> modelRows = new ArrayList<>();
                    for (Object item : list) {
                        if (item instanceof Map<?, ?> raw) {
                            Map<String, Object> row = new LinkedHashMap<>();
                            raw.forEach((k, v) -> row.put(String.valueOf(k), v));
                            modelRows.add(row);
                        }
                    }
                    return modelRows;
                }
            }
        } catch (Exception ex) {
            log.debug("Worker matching Python model unavailable: {}", ex.getMessage());
        }

        return candidates;
    }

    private Map<String, Object> predictDelay(Project project, List<TaskEntity> tasks,
                                              long activeWorkers, long overdueTasks) {
        long daysLeft = 30;
        if (project.getEstEndDate() != null) {
            daysLeft = Math.max(1, ChronoUnit.DAYS.between(LocalDate.now(), project.getEstEndDate()));
        }

        double progress = project.getProgressPercentage() == null ? 0D : project.getProgressPercentage();
        Map<String, Object> python = executePython("ai-ml/inference/predict_delay.py",
                List.of(
                        String.valueOf(progress),
                        String.valueOf(Math.max(0, activeWorkers)),
                        String.valueOf(daysLeft)
                ));
        if (python != null && "success".equalsIgnoreCase(String.valueOf(python.get("status")))) {
            python.put("executionMode", "PYTHON_MODEL");
            python.put("overdue_tasks", overdueTasks);
            return python;
        }

        double taskRisk = Math.min(60D, overdueTasks * 15D);
        double progressRisk = Math.max(0D, 50D - progress) * 0.6D;
        double staffingRisk = activeWorkers == 0 ? 30D : 0D;
        double risk = Math.min(99D, Math.max(5D, taskRisk + progressRisk + staffingRisk));

        return Map.of(
                "status", "success",
                "risk_score", round(risk),
                "risk_level", riskLevel(risk),
                "estimated_delay_days", round(risk > 35 ? risk / 100D * daysLeft * 0.25D : 0D),
                "overdue_tasks", overdueTasks,
                "executionMode", "JAVA_FALLBACK"
        );
    }

    private void requireAiAccess(User user) {
        if (tenantAccessService.isSuperAdmin(user)
                || tenantAccessService.hasRole(user, "COMPANY_ADMIN")
                || tenantAccessService.hasRole(user, "PROJECT_MANAGER")) {
            return;
        }
        throw new com.buildtrack.ai.exception.UnauthorizedException(
                "AI Insights are not available for this role");
    }

    private Project requireVisibleProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found"));

        if (tenantAccessService.isSuperAdmin(user)) return project;

        if (user.getCompanyId() == null || project.getCompany() == null ||
                !user.getCompanyId().equals(project.getCompany().getId())) {
            throw new com.buildtrack.ai.exception.UnauthorizedException("You cannot access AI data for this company");
        }

        if (tenantAccessService.hasRole(user, "COMPANY_ADMIN")) return project;

        boolean assigned = projectAssignmentRepository.existsByProjectIdAndUserIdAndStatus(
                projectId, user.getId(), "ACTIVE");
        if (!assigned) {
            throw new com.buildtrack.ai.exception.UnauthorizedException(
                    "You can only access AI insights for projects assigned to you");
        }
        return project;
    }

    private Long requireCompanyId(User user) {
        if (user.getCompanyId() == null)
            throw new com.buildtrack.ai.exception.UnauthorizedException("Tenant is not assigned");
        return user.getCompanyId();
    }

    private Map<String, Object> executePython(String script, List<String> args) {
        try {
            Path scriptPath = Paths.get(script);
            if (!Files.exists(scriptPath)) return null;

            List<String> command = new ArrayList<>();
            command.add(System.getenv().getOrDefault("PYTHON_EXECUTABLE", "python"));
            command.add(scriptPath.toString());
            command.addAll(args);

            Process process = new ProcessBuilder(command)
                    .redirectErrorStream(true)
                    .start();

            String output;
            try (InputStream in = process.getInputStream()) {
                output = new String(in.readAllBytes(), StandardCharsets.UTF_8).trim();
            }
            int exit = process.waitFor();
            if (exit != 0 || output.isBlank()) return null;

            JsonNode node = objectMapper.readTree(output);
            Map<String, Object> result = objectMapper.convertValue(node, Map.class);
            return result;
        } catch (Exception ex) {
            log.debug("AI Python inference unavailable: {}", ex.getMessage());
            return null;
        }
    }

    private Map<String, Object> toMap(AiInsight insight) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", insight.getId());
        map.put("projectId", insight.getProject().getId());
        map.put("projectName", insight.getProject().getName());
        map.put("insightType", insight.getInsightType());
        map.put("riskLevel", insight.getRiskLevel().name());
        map.put("riskScore", insight.getRiskScore());
        map.put("recommendation", insight.getRecommendation());
        map.put("createdAt", insight.getCreatedAt());
        return map;
    }

    private AiInsight.RiskLevel toEntityRisk(String level) {
        return switch (level) {
            case "CRITICAL" -> AiInsight.RiskLevel.CRITICAL;
            case "HIGH" -> AiInsight.RiskLevel.HIGH;
            case "MEDIUM" -> AiInsight.RiskLevel.MEDIUM;
            default -> AiInsight.RiskLevel.LOW;
        };
    }

    private String riskLevel(double score) {
        if (score >= 80) return "CRITICAL";
        if (score >= 60) return "HIGH";
        if (score >= 35) return "MEDIUM";
        return "LOW";
    }

    private double number(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        try { return value == null ? 0D : Double.parseDouble(value.toString()); }
        catch (Exception ignored) { return 0D; }
    }

    private double round(double value) {
        return Math.round(value * 100D) / 100D;
    }

    private String buildRecommendation(Map<String, Object> cost, Map<String, Object> delay,
                                        long overdueTasks, long equipmentIssues, long lowStockMaterials) {
        List<String> recommendations = new ArrayList<>();

        if (number(cost.get("overrun_percentage")) >= 5D)
            recommendations.add("Review current project burn rate and remaining scope.");
        if (number(delay.get("risk_score")) >= 35D)
            recommendations.add("Review overdue milestones and rebalance the site workforce.");
        if (overdueTasks > 0)
            recommendations.add("Resolve overdue tasks before assigning new work.");
        if (equipmentIssues > 0)
            recommendations.add("Schedule maintenance for equipment with operational issues.");
        if (lowStockMaterials > 0)
            recommendations.add("Replenish low-stock construction materials.");
        if (recommendations.isEmpty())
            recommendations.add("Project is operating within the current AI risk thresholds. Continue monitoring.");

        return String.join(" ", recommendations);
    }
}
