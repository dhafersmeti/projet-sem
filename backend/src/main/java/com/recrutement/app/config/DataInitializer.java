package com.recrutement.app.config;

import com.recrutement.app.entity.User;
import com.recrutement.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Crée l'admin par défaut s'il n'existe pas encore
        if (!userRepository.existsByEmail("admin@app.com")) {
            User admin = User.builder()
                    .name("Administrateur")
                    .email("admin@app.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Utilisateur admin créé : admin@app.com / admin123");
        }
    }
}
