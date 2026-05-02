package com.recrutement.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalCandidates;
    private long totalJobOffers;
    private long activeApplications;
    private List<ApplicationDto> recentApplications;
}
