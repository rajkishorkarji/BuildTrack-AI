package com.buildtrack.ai.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteMapResponse {
    private String name;
    private Integer count;
    private String tone;
}
