package com.recrutement.app.mapper;

import com.recrutement.app.dto.ApplicationDto;
import com.recrutement.app.dto.StatusHistoryEntryDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.StatusHistoryEntry;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ApplicationMapper {

    public ApplicationDto toDto(Application application) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(application.getId());
        dto.setCandidateId(application.getCandidate().getId());
        dto.setCandidateName(application.getCandidate().getName());
        dto.setCandidateEmail(application.getCandidate().getEmail());
        dto.setJobOfferId(application.getJobOffer().getId());
        dto.setJobOfferTitle(application.getJobOffer().getTitle());
        dto.setStatus(application.getStatus());
        dto.setAppliedDate(application.getAppliedDate());
        dto.setUpdatedAt(application.getUpdatedAt());
        return dto;
    }

    public ApplicationDto toDtoWithHistory(Application application) {
        ApplicationDto dto = toDto(application);
        List<StatusHistoryEntryDto> history = application.getStatusHistory().stream()
                .map(this::toHistoryDto)
                .collect(Collectors.toList());
        dto.setStatusHistory(history);
        return dto;
    }

    public StatusHistoryEntryDto toHistoryDto(StatusHistoryEntry entry) {
        StatusHistoryEntryDto dto = new StatusHistoryEntryDto();
        dto.setId(entry.getId());
        dto.setOldStatus(entry.getOldStatus());
        dto.setNewStatus(entry.getNewStatus());
        dto.setChangedAt(entry.getChangedAt());
        dto.setChangedBy(entry.getChangedBy());
        return dto;
    }
}
