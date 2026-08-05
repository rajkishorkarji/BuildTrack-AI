package com.buildtrack.ai.dto.worker;

import lombok.Data;

@Data
public class WorkerResponse {
    private Long id;
    private String fullName;
    private String skillTrade;
    private String phone;
    private String status;
}
