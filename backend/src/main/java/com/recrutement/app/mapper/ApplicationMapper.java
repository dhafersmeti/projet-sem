package com.recrutement.app.mapper;

import com.recrutement.app.dto.ApplicationDto;
import com.recrutement.app.entity.Application;
import org.springframework.stereotype.Component;

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
        return dto;
    }
}
