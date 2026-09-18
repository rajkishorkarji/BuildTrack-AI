package com.buildtrack.ai.service;

import com.buildtrack.ai.dto.attendance.DynamicQrResponse;
import com.buildtrack.ai.entity.Project;
import com.buildtrack.ai.repository.ProjectRepository;
import com.buildtrack.ai.service.impl.DynamicQrServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DynamicQrServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private DynamicQrServiceImpl dynamicQrService;

    private Project testProject;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dynamicQrService, "secretKey", "test-secret-key-at-least-32-chars-long!");
        testProject = new Project();
        testProject.setId(101L);
        testProject.setName("Berhampur Bridge");
    }

    @Test
    void testGenerateAndValidateDynamicToken() {
        when(projectRepository.findById(101L)).thenReturn(Optional.of(testProject));

        DynamicQrResponse response = dynamicQrService.generateProjectDynamicToken(101L);
        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(response.getToken().startsWith("BT-DYN:101:"));
        assertTrue(response.getExpiresInSeconds() > 0 && response.getExpiresInSeconds() <= 30);

        boolean valid = dynamicQrService.validateDynamicToken(response.getToken(), 101L);
        assertTrue(valid, "Generated token should be immediately valid");
    }

    @Test
    void testValidateTokenWithWrongProjectFails() {
        when(projectRepository.findById(101L)).thenReturn(Optional.of(testProject));

        DynamicQrResponse response = dynamicQrService.generateProjectDynamicToken(101L);
        boolean valid = dynamicQrService.validateDynamicToken(response.getToken(), 999L);
        assertFalse(valid, "Token for project 101 should fail validation against project 999");
    }

    @Test
    void testTamperedTokenFails() {
        when(projectRepository.findById(101L)).thenReturn(Optional.of(testProject));

        DynamicQrResponse response = dynamicQrService.generateProjectDynamicToken(101L);
        String tampered = response.getToken() + "tampered";
        boolean valid = dynamicQrService.validateDynamicToken(tampered, 101L);
        assertFalse(valid, "Tampered token must fail signature verification");
    }

    @Test
    void testIsDynamicToken() {
        assertTrue(dynamicQrService.isDynamicToken("BT-DYN:101:5000:abcdef"));
        assertFalse(dynamicQrService.isDynamicToken("QR-WRK-00005"));
        assertFalse(dynamicQrService.isDynamicToken("QRWRK900001"));
        assertFalse(dynamicQrService.isDynamicToken(null));
    }
}