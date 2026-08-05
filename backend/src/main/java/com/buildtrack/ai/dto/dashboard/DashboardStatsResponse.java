package com.buildtrack.ai.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private String label;
    private String value;
    private String delta;
    private String tone;
    private String subtitle;
}
