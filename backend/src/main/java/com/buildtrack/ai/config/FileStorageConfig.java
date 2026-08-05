package com.buildtrack.ai.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.File;

@Configuration
public class FileStorageConfig {

    private static final String UPLOAD_DIR = "uploads";

    @PostConstruct
    public void init() {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    public String getUploadDir() {
        return UPLOAD_DIR;
    }
}
