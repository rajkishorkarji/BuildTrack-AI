package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.entity.Attendance;
import com.buildtrack.ai.entity.Equipment;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.AttendanceRepository;
import com.buildtrack.ai.repository.EquipmentRepository;
import com.buildtrack.ai.repository.FinanceRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.TaskRepository;
import com.buildtrack.ai.repository.WorkerRepository;
import com.buildtrack.ai.service.DashboardService;
import com.buildtrack.ai.service.TenantAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    private final ProjectRepository projectRepository;
    private final WorkerRepository workerRepository;
    private final EquipmentRepository equipmentRepository;
    private final TaskRepository taskRepository;
    private final AttendanceRepository attendanceRepository;
    private final FinanceRepository financeRepository;
    private final TenantAccessService tenantAccessService;

    private Long companyIdOrNull() {
        User user = tenantAccessService.currentUser();
        return tenantAccessService.isSuperAdmin(user) ? null : tenantAccessService.currentCompany().getId();
    }

    private List<Project> projects() {
        Long companyId = companyIdOrNull();
        return companyId == null ? projectRepository.findAll() : projectRepository.findByCompanyId(companyId);
    }

    @Override
    public List<Map<String, Object>> getStats() {
        Long companyId = companyIdOrNull();
        long projectCount = projects().stream().filter(p -> !"COMPLETED".equalsIgnoreCase(p.getStatus())).count();
        long workerCount = companyId == null ? workerRepository.count() : workerRepository.findByCompanyId(companyId).size();
        List<Equipment> equipment = companyId == null ? equipmentRepository.findAll() : equipmentRepository.findByProjectCompanyId(companyId);
        long inUse = equipment.stream().filter(e -> e.getStatus() != null && e.getStatus().name().equalsIgnoreCase("IN_USE")).count();
        long pending = (companyId == null ? taskRepository.findAll() : taskRepository.findByProjectCompanyId(companyId)).stream()
                .filter(t -> !"COMPLETED".equalsIgnoreCase(t.getStatus())).count();

        return List.of(
                Map.of("label", "Total Active Projects", "value", String.valueOf(projectCount), "tone", "blue", "subtitle", "Across your sites"),
                Map.of("label", "Workers Present", "value", String.valueOf(todayPresent(companyId)), "tone", "green", "subtitle", "of " + workerCount + " workers"),
                Map.of("label", "Equipment In Use", "value", String.valueOf(inUse), "tone", "orange", "subtitle", "of " + equipment.size() + " units"),
                Map.of("label", "Pending Tasks", "value", String.valueOf(pending), "tone", "purple", "subtitle", "Current open tasks")
        );
    }

    private long todayPresent(Long companyId) {
    List<Attendance> rows = companyId == null
            ? attendanceRepository.findAll()
            : attendanceRepository.findByProjectCompanyIdOrderByCheckInDesc(companyId);

    LocalDate today = LocalDate.now();

    return rows.stream()
            .filter(a -> a.getCheckIn() != null)
            .filter(a -> a.getCheckIn().toLocalDate().equals(today))
            .filter(a -> a.getCheckOut() == null)
            .count();
    }
    @Override
public List<Map<String, Object>> getDailyActivities() {

    Long companyId = companyIdOrNull();

    List<Attendance> rows = companyId == null
            ? attendanceRepository.findAll()
            : attendanceRepository.findByProjectCompanyIdOrderByCheckInDesc(companyId);

    return rows.stream()
            .filter(a -> a.getCheckIn() != null)
            .sorted(
                    Comparator.comparing(
                            Attendance::getCheckIn
                    ).reversed()
            )
            .limit(10)
            .map(a -> Map.<String, Object>of(
                    "name",
                    a.getWorker() != null
                            ? a.getWorker().getFullName()
                            : "Worker",

                    "time",
                    a.getCheckIn().toLocalTime().toString(),

                    "detail",
                    "checked in at " +
                            (a.getProject() != null
                                    ? a.getProject().getName()
                                    : "project site"),

                    "status",
                    "green"
            ))
            .toList();
}

    @Override
    public List<Map<String, Object>> getSiteMapZones() {
        // Live GPS/zone data is intentionally empty until a worker location is recorded.
        return List.of();
    }

    @Override
    public List<Map<String, Object>> getProjectProgress() {
        return projects().stream().sorted(Comparator.comparing(Project::getProgressPercentage, Comparator.nullsFirst(Integer::compareTo)).reversed()).limit(10)
                .map(p -> Map.<String,Object>of(
                        "id", p.getId(), "name", p.getName(), "progressPercentage", p.getProgressPercentage() == null ? 0 : p.getProgressPercentage(),
                        "budget", p.getBudget() == null ? BigDecimal.ZERO : p.getBudget(), "spent", p.getSpent() == null ? BigDecimal.ZERO : p.getSpent()))
                .toList();
    }

    @Override
    public List<Map<String, Object>> getAnalytics() {
        Long companyId = companyIdOrNull();
        List<Project> projectRows = projects();
        BigDecimal budget = projectRows.stream().map(Project::getBudget).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal spent = projectRows.stream().map(Project::getSpent).filter(v -> v != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Equipment> equipment = companyId == null ? equipmentRepository.findAll() : equipmentRepository.findByProjectCompanyId(companyId);
        long inUse = equipment.stream().filter(e -> e.getStatus() != null && e.getStatus().name().equalsIgnoreCase("IN_USE")).count();
        BigDecimal revenue = (companyId == null ? financeRepository.findAll() : financeRepository.findByProjectCompanyId(companyId)).stream()
                .map(f -> f.getAmount() == null ? BigDecimal.ZERO : f.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal budgetPct = budget.signum() == 0 ? BigDecimal.ZERO : spent.multiply(BigDecimal.valueOf(100)).divide(budget, 1, RoundingMode.HALF_UP);
        BigDecimal equipmentPct = equipment.isEmpty() ? BigDecimal.ZERO : BigDecimal.valueOf(inUse * 100.0 / equipment.size()).setScale(1, RoundingMode.HALF_UP);
        return List.of(
                Map.of("label", "Budget Utilization", "value", budgetPct + "%", "trend", "", "tone", "blue"),
                Map.of("label", "Worker Productivity", "value", "—", "trend", "", "tone", "green"),
                Map.of("label", "Equipment Usage", "value", equipmentPct + "%", "trend", "", "tone", "orange"),
                Map.of("label", "Revenue / Finance", "value", "₹" + revenue.setScale(0, RoundingMode.HALF_UP), "trend", "", "tone", "purple")
        );
    }
}
