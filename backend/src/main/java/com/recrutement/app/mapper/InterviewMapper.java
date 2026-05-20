package com.recrutement.app.mapper;

import com.recrutement.app.dto.InterviewDto;
import com.recrutement.app.entity.Interview;
import org.springframework.stereotype.Component;

@Component
public class InterviewMapper {

    public InterviewDto toDto(Interview interview) {
        InterviewDto dto = new InterviewDto();
        dto.setId(interview.getId());
        dto.setApplicationId(interview.getApplication().getId());
        dto.setCandidateName(interview.getApplication().getCandidate().getName());
        dto.setJobOfferTitle(interview.getApplication().getJobOffer().getTitle());
        dto.setDate(interview.getDate());
        dto.setTime(interview.getTime());
        dto.setLocation(interview.getLocation());
        dto.setMeetingLink(interview.getMeetingLink());
        dto.setPreparationInstructions(interview.getPreparationInstructions());
        dto.setStatus(interview.getStatus());
        dto.setHasEvaluation(interview.getEvaluation() != null);
        return dto;
    }
}
