package com.recrutement.app.controller;

import com.recrutement.app.dto.RegisterRequest;
import com.recrutement.app.entity.User;
import com.recrutement.app.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/recruiters")
    public ResponseEntity<?> getRecruiters() {
        List<Map<String, Object>> recruiters = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.RECRUITER)
                .map(u -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getName());
                    m.put("email", u.getEmail());
                    m.put("enabled", u.isEnabled());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(recruiters);
    }

    @PostMapping("/recruiters")
    public ResponseEntity<?> createRecruiter(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cet email est déjà utilisé"));
        }
        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.RECRUITER)
                .firstLogin(false)
                .enabled(true)
                .build();
        userRepository.save(newUser);
        log.info("Recruteur créé par admin : {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Recruteur créé avec succès"));
    }

    @DeleteMapping("/recruiters/{id}")
    public ResponseEntity<?> deleteRecruiter(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        if (user.getRole() != User.Role.RECRUITER) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Seuls les recruteurs peuvent être supprimés via cette route"));
        }
        userRepository.delete(user);
        log.info("Recruteur supprimé : #{}", id);
        return ResponseEntity.noContent().build();
    }
}
