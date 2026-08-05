package com.buildtrack.ai.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private String name;
    private String time;
    private String detail;
    private String status;
}
