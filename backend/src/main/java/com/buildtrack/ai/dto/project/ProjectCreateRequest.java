package com.buildtrack.ai.dto.project;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ProjectCreateRequest {
    @NotBlank private String name;
    private String code;
    private String location;
    private String description;
    @NotNull @DecimalMin("0.00") private BigDecimal budget;
    private LocalDate startDate;
    private LocalDate estEndDate;
    private String status;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEstEndDate() { return estEndDate; }
    public void setEstEndDate(LocalDate estEndDate) { this.estEndDate = estEndDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
