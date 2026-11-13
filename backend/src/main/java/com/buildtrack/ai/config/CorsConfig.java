package com.buildtrack.ai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * MVC-layer CORS config (applies AFTER Spring Security filter chain).
 * Spring Security's CorsConfigurationSource in SecurityConfig is the
 * primary CORS handler for preflight requests. This configurer adds
 * a matching CORS policy at the MVC level as a safety net for any
 * requests that bypass the security filter chain (e.g. error handlers).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type", "X-Total-Count")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
