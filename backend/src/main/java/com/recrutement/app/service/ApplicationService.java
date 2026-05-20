package com.recrutement.app.service;

import com.recrutement.app.dto.ApplicationDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.Candidate;
import com.recrutement.app.entity.JobOffer;
import com.recrutement.app.entity.StatusHistoryEntry;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.ApplicationMapper;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.JobOfferRepository;
import com.recrutement.app.repository.StatusHistoryEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@SuppressWarnings("null")
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final StatusHistoryEntryRepository statusHistoryEntryRepository;
    private final ApplicationMapper applicationMapper;
    private final NotificationService notificationService;

    public List<ApplicationDto> findAll() {
        return applicationRepository.findAll(Sort.by(Sort.Direction.DESC, "appliedDate")).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    public ApplicationDto findById(Long id) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable avec l'id : " + id));
        return applicationMapper.toDtoWithHistory(application);
    }

    public ApplicationDto create(ApplicationDto dto) {
        Candidate candidate = candidateRepository.findById(dto.getCandidateId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidat introuvable avec l'id : " + dto.getCandidateId()));
        JobOffer jobOffer = jobOfferRepository.findById(dto.getJobOfferId())
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable avec l'id : " + dto.getJobOfferId()));

        Application application = Application.builder()
                .candidate(candidate)
                .jobOffer(jobOffer)
                .status(Application.Status.RECEIVED)
                .build();

        Application saved = applicationRepository.save(application);
        logStatusChange(saved, null, Application.Status.RECEIVED, "system");
        return applicationMapper.toDto(saved);
    }

    public ApplicationDto updateStatus(Long id, String status, String changedBy) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable avec l'id : " + id));
        Application.Status newStatus;
        try {
            newStatus = Application.Status.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide : " + status);
        }
        Application.Status oldStatus = application.getStatus();
        application.setStatus(newStatus);
        Application saved = applicationRepository.save(application);
        logStatusChange(saved, oldStatus, newStatus, changedBy);
        notificationService.createForStatusChange(saved, newStatus);
        log.info("Statut candidature #{} : {} → {} (par {})", id, oldStatus, newStatus, changedBy);
        return applicationMapper.toDto(saved);
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

    public List<ApplicationDto> findByJobOfferId(Long jobOfferId) {
        return applicationRepository.findByJobOfferIdOrderByUpdatedAtDesc(jobOfferId).stream()
                .map(applicationMapper::toDtoWithHistory)
                .collect(Collectors.toList());
    }

    public long countActive() {
        return applicationRepository.countByStatusIn(
                List.of(Application.Status.RECEIVED,
                        Application.Status.UNDER_REVIEW,
                        Application.Status.INTERVIEW,
                        Application.Status.EVALUATION)
        );
    }

    public List<ApplicationDto> findRecent(int limit) {
        return applicationRepository.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "appliedDate"))
        ).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    private void logStatusChange(Application application, Application.Status oldStatus,
                                  Application.Status newStatus, String changedBy) {
        StatusHistoryEntry entry = StatusHistoryEntry.builder()
                .application(application)
                .oldStatus(oldStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .build();
        statusHistoryEntryRepository.save(entry);
    }
}
