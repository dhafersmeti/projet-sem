package com.recrutement.app.service;

import com.recrutement.app.dto.DashboardStatsDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.JobOffer;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationService applicationService;

    public DashboardStatsDto getStats() {
        long total = applicationRepository.count();
        long accepted = applicationRepository.countByStatus(Application.Status.ACCEPTED);
        double conversionRate = total > 0 ? (double) accepted / total : 0.0;

        Double avgDays = applicationRepository.findAverageRecruitmentDays();
        double averageDays = avgDays != null ? Math.round(avgDays * 10.0) / 10.0 : 0.0;

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Application.Status s : Application.Status.values()) {
            byStatus.put(s.name(), applicationRepository.countByStatus(s));
        }

        long openPositions = jobOfferRepository.countByStatus(JobOffer.Status.PUBLISHED);

        return DashboardStatsDto.builder()
                .openPositions(openPositions)
                .activeCandidates(candidateRepository.count())
                .totalApplications(total)
                .conversionRate(Math.round(conversionRate * 100.0) / 100.0)
                .averageRecruitmentDays(averageDays)
                .applicationsByStatus(byStatus)
                .recentApplications(applicationService.findRecent(10))
                // Legacy
                .totalCandidates(candidateRepository.count())
                .totalJobOffers(jobOfferRepository.count())
                .activeApplications(applicationService.countActive())
                .pendingCount(applicationRepository.countByStatus(Application.Status.RECEIVED))
                .interviewCount(applicationRepository.countByStatus(Application.Status.INTERVIEW))
                .acceptedCount(accepted)
                .rejectedCount(applicationRepository.countByStatus(Application.Status.REJECTED))
                .build();
    }

    public List<Map<String, Object>> getReportByPosition() {
        return jobOfferRepository.findAll().stream()
                .map(offer -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("positionId", offer.getId());
                    row.put("position", offer.getTitle());
                    List<Application> apps = applicationRepository.findByJobOfferId(offer.getId());
                    long acceptedCount = apps.stream()
                            .filter(a -> a.getStatus() == Application.Status.ACCEPTED).count();
                    long rejectedCount = apps.stream()
                            .filter(a -> a.getStatus() == Application.Status.REJECTED).count();
                    row.put("totalApplications", apps.size());
                    row.put("accepted", acceptedCount);
                    row.put("rejected", rejectedCount);
                    row.put("conversionRate", apps.isEmpty() ? 0.0
                            : Math.round((double) acceptedCount / apps.size() * 100.0) / 100.0);
                    return row;
                })
                .collect(Collectors.toList());
    }
}
