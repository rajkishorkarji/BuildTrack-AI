package com.buildtrack.ai.dto.project;

import lombok.Data;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String code;
    private String location;
    private Integer progressPercentage;
    private String status;
    private Double latitude;
    private Double longitude;
    private Double geofenceRadiusMeters;
}
