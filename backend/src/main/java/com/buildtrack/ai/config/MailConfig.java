package com.buildtrack.ai.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.username:rajkishorkarji07@gmail.com}")
    private String username;

    @Value("${spring.mail.password:bpnixcfjjxzrqiul}")
    private String password;

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host != null && !host.isBlank() ? host.trim() : "smtp.gmail.com");
        mailSender.setPort(port > 0 ? port : 587);

        // Sanitize username and password - remove all spaces/whitespace common in Google app passwords
        String cleanUser = username != null ? username.replaceAll("\\s+", "").trim() : "rajkishorkarji07@gmail.com";
        String cleanPass = password != null ? password.replaceAll("\\s+", "").trim() : "bpnixcfjjxzrqiul";

        mailSender.setUsername(cleanUser);
        mailSender.setPassword(cleanPass);
        mailSender.setDefaultEncoding("UTF-8");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtp.ssl.trust", host != null && !host.isBlank() ? host.trim() : "smtp.gmail.com");
        props.put("mail.smtp.connectiontimeout", "15000");
        props.put("mail.smtp.timeout", "15000");
        props.put("mail.smtp.writetimeout", "15000");

        return mailSender;
    }
}
