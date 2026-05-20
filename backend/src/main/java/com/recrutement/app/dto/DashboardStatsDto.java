package com.recrutement.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long openPositions;
    private long activeCandidates;
    private long totalApplications;
    private double conversionRate;
    private double averageRecruitmentDays;
    private Map<String, Long> applicationsByStatus;
    private List<ApplicationDto> recentApplications;

    // Legacy fields kept for backward compatibility
    private long totalCandidates;
    private long totalJobOffers;
    private long activeApplications;
    private long pendingCount;
    private long interviewCount;
    private long acceptedCount;
    private long rejectedCount;
}
