package com.buildtrack.ai.service.impl;

import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.dto.project.ProjectRequest;
import com.buildtrack.ai.dto.project.ProjectResponse;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.service.ProjectService;
import com.buildtrack.ai.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<ProjectResponse> getProjectsForCurrentUser() {
        User currentUser = SecurityUtils.getCurrentUser();
        List<Project> projects;

        if ("ROLE_SUPER_ADMIN".equals(currentUser.getRole().getName())) {
            projects = projectRepository.findAll();
        } else {
            projects = projectRepository.findByCreatedByIdOrAssignedUsersId(currentUser.getId(), currentUser.getId());
        }

        return projects.stream()
                .map(p -> modelMapper.map(p, ProjectResponse.class))
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        Project project = modelMapper.map(request, Project.class);
        project.setCreatedBy(currentUser);

        Project saved = projectRepository.save(project);
        return modelMapper.map(saved, ProjectResponse.class);
    }
}