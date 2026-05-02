package com.recrutement.app.service;

import com.recrutement.app.dto.DashboardStatsDto;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationService applicationService;

    public DashboardStatsDto getStats() {
        return DashboardStatsDto.builder()
                .totalCandidates(candidateRepository.count())
                .totalJobOffers(jobOfferRepository.count())
                .activeApplications(applicationService.countActive())
                .recentApplications(applicationService.findRecent(5))
                .build();
    }
}
