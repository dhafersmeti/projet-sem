package com.recrutement.app.controller;

import com.recrutement.app.dto.CandidateRegisterRequest;
import com.recrutement.app.dto.LoginRequest;
import com.recrutement.app.dto.LoginResponse;
import com.recrutement.app.dto.RegisterRequest;
import com.recrutement.app.entity.Candidate;
import com.recrutement.app.entity.User;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.UserRepository;
import com.recrutement.app.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // Spring Security vérifie les credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtUtils.generateToken(userDetails);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .candidateId(user.getCandidateId())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Cet email est déjà utilisé"));
        }

        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.RECRUITER)
                .build();

        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Recruteur créé avec succès"));
    }

    @PostMapping("/candidate/register")
    public ResponseEntity<?> registerCandidate(@Valid @RequestBody CandidateRegisterRequest request) {
        Candidate candidate = candidateRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Aucun candidat trouvé avec cet email. Contactez le recruteur."));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Un compte existe déjà pour cet email"));
        }

        User newUser = User.builder()
                .name(candidate.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.CANDIDATE)
                .candidateId(candidate.getId())
                .build();

        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Compte candidat créé avec succès"));
    }
}
