package com.recrutement.app.service;

import com.recrutement.app.dto.CandidateDto;
import com.recrutement.app.entity.Candidate;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.CandidateMapper;
import com.recrutement.app.repository.CandidateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CandidateMapper candidateMapper;

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
        Candidate candidate = candidateMapper.toEntity(dto);
        return candidateMapper.toDto(candidateRepository.save(candidate));
    }

    public CandidateDto update(Long id, CandidateDto dto) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        // Vérifier unicité email si changé
        if (!candidate.getEmail().equals(dto.getEmail()) && candidateRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé par un autre candidat");
        }

        candidateMapper.updateEntity(candidate, dto);
        return candidateMapper.toDto(candidateRepository.save(candidate));
    }

    public void delete(Long id) {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        // Supprimer le fichier CV s'il existe
        if (candidate.getCvFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(candidate.getCvFilePath()));
            } catch (IOException e) {
                // Pas bloquant si la suppression du fichier échoue
            }
        }
        candidateRepository.delete(candidate);
    }

    public String uploadCv(Long id, MultipartFile file) throws IOException {
        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + id));

        // Validation : uniquement PDF
        if (file.getContentType() == null || !file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont acceptés");
        }

        // Créer le dossier s'il n'existe pas
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Générer un nom unique pour éviter les collisions
        String originalName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueName = UUID.randomUUID() + "_" + originalName;
        Path filePath = uploadPath.resolve(uniqueName);

        // Supprimer l'ancien CV si existe
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
}
