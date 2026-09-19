package com.buildtrack.ai.config;

import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@Configuration
public class DatabaseConfig implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (bean instanceof DataSourceProperties properties) {
            String url = properties.getUrl();
            if (url != null) {
                normalize(properties, url);
            }
        }
        return bean;
    }

    private void normalize(DataSourceProperties properties, String rawUrl) {
        try {
            String clean = rawUrl.trim();
            if (clean.startsWith("jdbc:")) {
                clean = clean.substring("jdbc:".length());
            }

            if (clean.startsWith("postgres://") || clean.startsWith("postgresql://")) {
                URI uri = URI.create(clean.replaceFirst("^postgres(ql)?://", "http://"));
                String userInfo = uri.getUserInfo();
                String host = uri.getHost();
                int port = uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                if (host != null) {
                    StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(host);
                    if (port > 0) {
                        jdbcUrl.append(":").append(port);
                    } else {
                        jdbcUrl.append(":5432");
                    }
                    if (path != null) {
                        jdbcUrl.append(path);
                    }
                    if (query != null && !query.isEmpty()) {
                        jdbcUrl.append("?").append(query);
                    }
                    properties.setUrl(jdbcUrl.toString());
                }

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    properties.setUsername(parts[0]);
                    properties.setPassword(parts[1]);
                } else if (userInfo != null && !userInfo.isEmpty()) {
                    properties.setUsername(userInfo);
                }
            }
        } catch (Exception e) {
            // Keep original url on unexpected parsing error
        }
    }
}
