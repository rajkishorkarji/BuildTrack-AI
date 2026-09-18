package com.buildtrack.ai.dto.project;

import lombok.Data;

@Data
public class ProjectRequest {
    private String name;
    private String code;
    private String location;
    private Integer progressPercentage;
    private Double latitude;
    private Double longitude;
    private Double geofenceRadiusMeters;
}
