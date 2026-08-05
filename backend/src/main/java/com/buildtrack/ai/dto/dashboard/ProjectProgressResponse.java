package com.buildtrack.ai.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectProgressResponse {
    private String name;
    private Integer progress;
    private String status;
}
