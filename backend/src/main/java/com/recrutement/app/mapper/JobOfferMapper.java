package com.recrutement.app.mapper;

import com.recrutement.app.dto.JobOfferDto;
import com.recrutement.app.entity.JobOffer;
import org.springframework.stereotype.Component;

@Component
public class JobOfferMapper {

    public JobOfferDto toDto(JobOffer jobOffer) {
        JobOfferDto dto = new JobOfferDto();
        dto.setId(jobOffer.getId());
        dto.setTitle(jobOffer.getTitle());
        dto.setDescription(jobOffer.getDescription());
        dto.setRequiredSkills(jobOffer.getRequiredSkills());
        dto.setDatePosted(jobOffer.getDatePosted());
        dto.setStatus(jobOffer.getStatus());
        dto.setApplicationCount(jobOffer.getApplications().size());
        return dto;
    }

    public JobOffer toEntity(JobOfferDto dto) {
        JobOffer jobOffer = new JobOffer();
        jobOffer.setTitle(dto.getTitle());
        jobOffer.setDescription(dto.getDescription());
        jobOffer.setRequiredSkills(dto.getRequiredSkills());
        if (dto.getStatus() != null) jobOffer.setStatus(dto.getStatus());
        return jobOffer;
    }

    public void updateEntity(JobOffer jobOffer, JobOfferDto dto) {
        jobOffer.setTitle(dto.getTitle());
        jobOffer.setDescription(dto.getDescription());
        jobOffer.setRequiredSkills(dto.getRequiredSkills());
        if (dto.getStatus() != null) jobOffer.setStatus(dto.getStatus());
    }
}
