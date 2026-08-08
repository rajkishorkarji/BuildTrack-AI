package com.buildtrack.ai.config;

import com.buildtrack.ai.entity.*;
import com.buildtrack.ai.repository.*;
import com.buildtrack.ai.auth.entity.Role;
import com.buildtrack.ai.auth.entity.User;
import com.buildtrack.ai.auth.entity.AuthProvider;
import com.buildtrack.ai.auth.repository.RoleRepository;
import com.buildtrack.ai.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CompanyRepository companyRepository;

    private final ProjectRepository projectRepository;

    private final WorkerRepository workerRepository;

    private final TaskRepository taskRepository;

    private final EquipmentRepository equipmentRepository;

    private final FinanceRepository financeRepository;

    private final DocumentRepository documentRepository;

    private final AiInsightRepository aiInsightRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    DataInitializer(CompanyRepository companyRepository, ProjectRepository projectRepository, WorkerRepository workerRepository, TaskRepository taskRepository, EquipmentRepository equipmentRepository, FinanceRepository financeRepository, DocumentRepository documentRepository, AiInsightRepository aiInsightRepository, UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.projectRepository = projectRepository;
        this.workerRepository = workerRepository;
        this.taskRepository = taskRepository;
        this.equipmentRepository = equipmentRepository;
        this.financeRepository = financeRepository;
        this.documentRepository = documentRepository;
        this.aiInsightRepository = aiInsightRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("raj@buildtrack.ai")) {
            Role superAdminRole = roleRepository.findByRoleName("SUPER_ADMIN").orElseGet(() -> {
                Role role = new Role();
                role.setRoleName("SUPER_ADMIN");
                return roleRepository.save(role);
            });
            User superAdmin = User.builder()
                    .firstName("System")
                    .lastName("Master Admin")
                    .email("raj@buildtrack.ai")
                    .phone("+91 9876543210")
                    .password(passwordEncoder.encode("Admin@123"))
                    .enabled(true)
                    .provider(AuthProvider.LOCAL)
                    .roles(java.util.Set.of(superAdminRole))
                    .build();
            userRepository.save(superAdmin);
        }
        if (companyRepository.count() == 0) {
            Company company = new Company();
            company.setName("Solviontech Infrastructure Ltd");
            company.setEmail("admin@solviontech.com");
            company.setAdminName("Solvion Admin");
            company.setAdminEmail("admin@solviontech.com");
            company.setPhone("+91 98765 00000");
            company.setCode("SOLV-CO");
            company.setPlan("Professional");
            company.setSubscriptionStatus("ACTIVE");
            company.setStatus("ACTIVE");
            Company savedCompany = companyRepository.save(company);

            Project p1 = new Project();
            p1.setName("Metro Tower Complex");
            p1.setLocation("Mumbai Central");
            p1.setProgressPercentage(66);
            p1.setStatus("Active");
            p1.setCompany(savedCompany);
            Project savedP1 = projectRepository.save(p1);

            Project p2 = new Project();
            p2.setName("Riverside Apartments");
            p2.setLocation("Pune Sector 4");
            p2.setProgressPercentage(82);
            p2.setStatus("Active");
            p2.setCompany(savedCompany);
            projectRepository.save(p2);

            Worker w1 = Worker.builder()
                    .fullName("Rose Smith")
                    .skillTrade("Mason")
                    .phone("+91 98765 43210")
                    .dailyWage(new BigDecimal("1200"))
                    .qrCodeToken("QR-W101")
                    .status(Worker.WorkerStatus.ACTIVE)
                    .build();
            workerRepository.save(w1);

            Worker w2 = Worker.builder()
                    .fullName("Robert Fox")
                    .skillTrade("Structural Welder")
                    .phone("+91 98765 43211")
                    .dailyWage(new BigDecimal("1500"))
                    .qrCodeToken("QR-W102")
                    .status(Worker.WorkerStatus.ACTIVE)
                    .build();
            workerRepository.save(w2);

            TaskEntity t1 = new TaskEntity();
            t1.setTitle("Diamond Saw Cutting");
            t1.setPriority("HIGH");
            t1.setCompletionPercentage(66);
            t1.setStatus("IN_PROGRESS");
            t1.setProject(savedP1);
            taskRepository.save(t1);

            Equipment eq1 = Equipment.builder()
                    .name("Tower Crane TC-500")
                    .category("Lifting")
                    .status(Equipment.EquipmentStatus.OPERATIONAL)
                    .dailyCost(new BigDecimal("25000"))
                    .project(savedP1)
                    .build();
            equipmentRepository.save(eq1);

            Finance f1 = Finance.builder()
                    .invoiceNumber("INV-2025-001")
                    .vendorName("Steeltech Supplies")
                    .category("Raw Materials")
                    .amount(new BigDecimal("4500000"))
                    .gstAmount(new BigDecimal("810000"))
                    .status(Finance.InvoiceStatus.PAID)
                    .dueDate(LocalDate.now().plusDays(15))
                    .project(savedP1)
                    .build();
            financeRepository.save(f1);

            Document d1 = Document.builder()
                    .title("Structural_Blueprint_TowerA_v4.pdf")
                    .fileType("pdf")
                    .fileUrl("uploads/Structural_Blueprint_TowerA_v4.pdf")
                    .uploadedBy("Divya Krishnan")
                    .project(savedP1)
                    .build();
            documentRepository.save(d1);

            AiInsight i1 = AiInsight.builder()
                    .insightType("CRITICAL_RISK")
                    .riskLevel(AiInsight.RiskLevel.HIGH)
                    .riskScore(new BigDecimal("94.0"))
                    .recommendation("Humidity drop in Zone B may extend curing time by 18 hours.")
                    .project(savedP1)
                    .build();
            aiInsightRepository.save(i1);
        }
    }
}
