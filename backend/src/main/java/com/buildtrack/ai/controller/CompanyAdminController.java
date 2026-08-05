package com.buildtrack.ai.controller;

import com.buildtrack.ai.auth.dto.ApiResponse;
import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/company")
public class CompanyAdminController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ProjectService projectService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCompanyOverview() {
        Company comp = companyRepository.findAll().stream().findFirst().orElse(null);
        Map<String, Object> data = new HashMap<>();
        data.put("companyName", comp != null ? comp.getName() : "Solviontech Infrastructure Ltd");
        data.put("totalFinancialCap", 500000.00);
        data.put("cpi", 0.895);
        data.put("spi", 0.765);
        data.put("activeEmployees", 850);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project project) {
        Company comp = companyRepository.findAll().stream().findFirst().orElseGet(() -> {
            Company c = new Company();
            c.setName("Default Company");
            c.setEmail("admin@default.com");
            return companyRepository.save(c);
        });
        Project created = projectService.createProject(comp.getId(), project);
        return ResponseEntity.ok(ApiResponse.success(created));
    }
}
