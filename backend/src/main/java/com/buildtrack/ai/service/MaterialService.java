package com.buildtrack.ai.service;

import com.buildtrack.ai.entity.Material;
import com.buildtrack.ai.entity.MaterialTransaction;

import java.util.List;

public interface MaterialService {
    List<Material> getVisibleMaterials(Long projectId);
    Material create(Material material);
    MaterialTransaction receive(Long materialId, MaterialTransaction transaction);
    MaterialTransaction issue(Long materialId, MaterialTransaction transaction);
    List<MaterialTransaction> history(Long materialId);
}
