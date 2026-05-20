package com.recrutement.app.service;

import com.recrutement.app.dto.CandidateDto;
import com.recrutement.app.entity.Candidate;
import com.recrutement.app.entity.JobOffer;
import com.recrutement.app.entity.User;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.CandidateMapper;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.JobOfferRepository;
import com.recrutement.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@SuppressWarnings("null")
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final UserRepository userRepository;
    private final JobOfferRepository jobOfferRepository;
    private final CandidateMapper candidateMapper;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<CandidateDto> findAll(String search) {
        List<Candidate> candidates;
        if (search != null && !search.isBlank()) {
            candidates = candidateRepository.searchCandidates(search);
        } else {
            candidates = candidateRepository.findAll();
        }
        return candidates.stream()
                .map(candidateMapper::toDto)
                .collect(Collectors.toList());
    }

    public CandidateDto findById(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));
        return candidateMapper.toDto(candidate);
    }

    public CandidateDto create(CandidateDto dto) {
        if (candidateRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Un candidat avec cet email existe déjà");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Un compte utilisateur avec cet email existe déjà");
        }

        String rawPassword = generateRandomPassword();

        User user = User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(rawPassword))
                .role(User.Role.CANDIDATE)
                .firstLogin(true)
                .enabled(true)
                .phone(dto.getPhone())
                .build();
        User savedUser = userRepository.save(user);

        Candidate candidate = candidateMapper.toEntity(dto);
        candidate.setUser(savedUser);

        if (dto.getTargetJobOfferId() != null) {
            JobOffer jobOffer = jobOfferRepository.findById(dto.getTargetJobOfferId()).orElse(null);
            candidate.setTargetJobOffer(jobOffer);
        }

        Candidate savedCandidate = candidateRepository.save(candidate);

        savedUser.setCandidateId(savedCandidate.getId());
        userRepository.save(savedUser);

        notificationService.sendCredentials(savedUser.getId(), dto.getEmail(), dto.getName(), rawPassword);

        log.info("Candidat créé : {} (user #{}) — mot de passe temporaire envoyé", dto.getEmail(), savedUser.getId());
        return candidateMapper.toDto(savedCandidate);
    }

    public CandidateDto update(Long id, CandidateDto dto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        if (!candidate.getEmail().equals(dto.getEmail()) && candidateRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé par un autre candidat");
        }

        candidateMapper.updateEntity(candidate, dto);

        if (dto.getTargetJobOfferId() != null) {
            JobOffer jobOffer = jobOfferRepository.findById(dto.getTargetJobOfferId()).orElse(null);
            candidate.setTargetJobOffer(jobOffer);
        } else {
            candidate.setTargetJobOffer(null);
        }

        return candidateMapper.toDto(candidateRepository.save(candidate));
    }

    public void delete(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        if (candidate.getCvFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(candidate.getCvFilePath()));
            } catch (IOException ignored) {
            }
        }

        if (candidate.getUser() != null) {
            User user = candidate.getUser();
            candidate.setUser(null);
            candidateRepository.save(candidate);
            userRepository.delete(user);
        }

        candidateRepository.delete(candidate);
    }

    public String uploadCv(Long id, MultipartFile file) throws IOException {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        if (file.getContentType() == null || !file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont acceptés");
        }

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "cv.pdf"));
        String uniqueName = UUID.randomUUID() + "_" + originalName;
        Path filePath = uploadPath.resolve(uniqueName);

        if (candidate.getCvFilePath() != null) {
            Files.deleteIfExists(Paths.get(candidate.getCvFilePath()));
        }

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        candidate.setCvFileName(originalName);
        candidate.setCvFilePath(filePath.toString());
        candidateRepository.save(candidate);

        return originalName;
    }

    public Path getCvPath(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        if (candidate.getCvFilePath() == null) {
            throw new ResourceNotFoundException("Aucun CV trouvé pour ce candidat");
        }

        return Paths.get(candidate.getCvFilePath());
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
