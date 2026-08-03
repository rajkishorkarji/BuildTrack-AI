package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Company;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.CompanyRepository;
import com.buildtrack.ai.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CompanyRepository companyRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public List<Project> getProjectsByCompany(Long companyId) {
        return projectRepository.findByCompanyId(companyId);
    }

    public Project createProject(Long companyId, Project project) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        project.setCompany(company);
        return projectRepository.save(project);
    }

    public Project updateProgress(Long projectId, Integer progress) {
        Project proj = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        proj.setProgressPercentage(progress);
        if (progress >= 100) {
            proj.setStatus("Completed");
        }
        return projectRepository.save(proj);
    }
}