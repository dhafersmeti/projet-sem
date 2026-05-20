package com.recrutement.app.mapper;

import com.recrutement.app.dto.EvaluationDto;
import com.recrutement.app.entity.Evaluation;
import org.springframework.stereotype.Component;

@Component
public class EvaluationMapper {

    public EvaluationDto toDto(Evaluation evaluation) {
        EvaluationDto dto = new EvaluationDto();
        dto.setId(evaluation.getId());
        dto.setInterviewId(evaluation.getInterview().getId());
        dto.setCompetenceScore(evaluation.getCompetenceScore());
        dto.setAttitudeScore(evaluation.getAttitudeScore());
        dto.setPotentialScore(evaluation.getPotentialScore());
        dto.setGlobalScore(evaluation.getGlobalScore());
        dto.setRecommendation(evaluation.getRecommendation());
        dto.setComment(evaluation.getComment());
        return dto;
    }
}
