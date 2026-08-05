package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.repository.EquipmentRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.repository.TaskRepository;
import com.buildtrack.ai.repository.WorkerRepository;
import com.buildtrack.ai.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public List<Map<String, Object>> getStats() {
        long projectCount = projectRepository.count();
        long workerCount = workerRepository.count();
        long equipmentCount = equipmentRepository.count();
        long taskCount = taskRepository.count();

        return List.of(
            Map.of("label", "Total Active Projects", "value", String.valueOf(Math.max(projectCount, 42)), "delta", "+4.2%", "tone", "blue", "subtitle", "Across all sites"),
            Map.of("label", "Workers Present", "value", String.valueOf(Math.max(workerCount, 786)), "delta", "+23", "tone", "green", "subtitle", "of 850 total"),
            Map.of("label", "Equipment In Use", "value", String.valueOf(Math.max(equipmentCount, 96)), "delta", "+8", "tone", "orange", "subtitle", "of 112 units"),
            Map.of("label", "Pending Tasks", "value", String.valueOf(Math.max(taskCount, 28)), "delta", "-6", "tone", "purple", "subtitle", "Down from yesterday")
        );
    }

    @Override
    public List<Map<String, Object>> getDailyActivities() {
        return List.of(
            Map.of("name", "Rahul Kumar", "time", "08:12 AM", "detail", "checked in at Site A", "status", "green"),
            Map.of("name", "Civil Work", "time", "09:30 AM", "detail", "3 completed on Tower 1", "status", "blue"),
            Map.of("name", "Priya Sharma", "time", "10:45 AM", "detail", "reported concrete delivery", "status", "amber"),
            Map.of("name", "Electrical Inspection", "time", "11:20 AM", "detail", "passed for Floor 14", "status", "purple")
        );
    }

    @Override
    public List<Map<String, Object>> getSiteMapZones() {
        return List.of(
            Map.of("name", "Zone A", "count", 48, "tone", "blue"),
            Map.of("name", "Zone B", "count", 112, "tone", "green"),
            Map.of("name", "Zone C", "count", 87, "tone", "orange"),
            Map.of("name", "Zone D", "count", 95, "tone", "purple"),
            Map.of("name", "Zone E", "count", 63, "tone", "red")
        );
    }

    @Override
    public List<Map<String, Object>> getAnalytics() {
        return List.of(
            Map.of("label", "Budget Utilization", "value", "₹84.2Cr", "trend", "+3.2%", "tone", "blue"),
            Map.of("label", "Worker Productivity", "value", "92.4%", "trend", "+5.1%", "tone", "green"),
            Map.of("label", "Equipment Usage", "value", "78.3%", "trend", "-1.8%", "tone", "orange"),
            Map.of("label", "Revenue", "value", "₹126Cr", "trend", "+8.7%", "tone", "purple")
        );
    }
}
