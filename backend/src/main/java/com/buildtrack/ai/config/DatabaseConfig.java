package com.buildtrack.ai.config;

import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        if (bean instanceof DataSourceProperties properties) {
            String url = properties.getUrl();
            if (url != null) {
                if (url.startsWith("postgres://")) {
                    properties.setUrl("jdbc:postgresql://" + url.substring("postgres://".length()));
                } else if (url.startsWith("postgresql://")) {
                    properties.setUrl("jdbc:" + url);
                }
            }
        }
        return bean;
    }
}
