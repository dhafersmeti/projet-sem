package com.recrutement.app.service;

import com.recrutement.app.dto.ApplicationDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.Candidate;
import com.recrutement.app.entity.JobOffer;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.ApplicationMapper;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationMapper applicationMapper;

    public List<ApplicationDto> findAll() {
        return applicationRepository.findAll(Sort.by(Sort.Direction.DESC, "appliedDate")).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    public ApplicationDto findById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable avec l'id : " + id));
        return applicationMapper.toDto(application);
    }

    public ApplicationDto create(ApplicationDto dto) {
        Candidate candidate = candidateRepository.findById(dto.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + dto.getCandidateId()));
        JobOffer jobOffer = jobOfferRepository.findById(dto.getJobOfferId())
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable avec l'id : " + dto.getJobOfferId()));

        Application application = Application.builder()
                .candidate(candidate)
                .jobOffer(jobOffer)
                .status(Application.Status.PENDING)
                .build();

        return applicationMapper.toDto(applicationRepository.save(application));
    }

    public ApplicationDto updateStatus(Long id, String status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable avec l'id : " + id));
        try {
            application.setStatus(Application.Status.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + status);
        }
        return applicationMapper.toDto(applicationRepository.save(application));
    }

    public void delete(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Candidature introuvable avec l'id : " + id);
        }
        applicationRepository.deleteById(id);
    }

    public List<ApplicationDto> findByCandidateId(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    public long countActive() {
        return applicationRepository.countByStatusIn(
                List.of(Application.Status.PENDING, Application.Status.INTERVIEW)
        );
    }

    public List<ApplicationDto> findRecent(int limit) {
        return applicationRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "appliedDate"))
        ).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }
}
