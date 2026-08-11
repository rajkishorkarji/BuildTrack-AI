package com.buildtrack.ai.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {
    @Value("${app.storage.upload-dir:uploads}")
    private String uploadDir;
    @PostConstruct public void init() { try { Files.createDirectories(getUploadPath()); } catch (Exception e) { throw new IllegalStateException("Unable to initialize upload directory", e); } }
    public Path getUploadPath() { return Paths.get(uploadDir).toAbsolutePath().normalize(); }
    public String getUploadDir() { return uploadDir; }
}
