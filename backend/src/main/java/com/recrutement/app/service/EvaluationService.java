package com.recrutement.app.service;

import com.recrutement.app.dto.EvaluationDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.Evaluation;
import com.recrutement.app.entity.Interview;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.EvaluationMapper;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.EvaluationRepository;
import com.recrutement.app.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@SuppressWarnings("null")
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final EvaluationMapper evaluationMapper;

    public EvaluationDto create(EvaluationDto dto) {
        if (evaluationRepository.existsByInterviewId(dto.getInterviewId())) {
            throw new IllegalArgumentException("Une évaluation existe déjà pour cet entretien");
        }

        Interview interview = interviewRepository.findById(dto.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Entretien introuvable avec l'id : " + dto.getInterviewId()));

        Evaluation.Recommendation recommendation =
                dto.getRecommendation() != null ? dto.getRecommendation() : Evaluation.Recommendation.REJECT;

        Evaluation evaluation = Evaluation.builder()
                .interview(interview)
                .competenceScore(dto.getCompetenceScore())
                .attitudeScore(dto.getAttitudeScore())
                .potentialScore(dto.getPotentialScore())
                .recommendation(recommendation)
                .comment(dto.getComment())
                .build();

        Evaluation saved = evaluationRepository.save(evaluation);

        // Mettre le statut EVALUATION sur la candidature
        Application app = interview.getApplication();
        if (app.getStatus() == Application.Status.INTERVIEW) {
            app.setStatus(Application.Status.EVALUATION);
            applicationRepository.save(app);
        }

        log.info("Évaluation créée pour entretien #{} — score global : {}", dto.getInterviewId(), saved.getGlobalScore());
        return evaluationMapper.toDto(saved);
    }

    public EvaluationDto update(Long id, EvaluationDto dto) {
        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable avec l'id : " + id));

        evaluation.setCompetenceScore(dto.getCompetenceScore());
        evaluation.setAttitudeScore(dto.getAttitudeScore());
        evaluation.setPotentialScore(dto.getPotentialScore());
        if (dto.getRecommendation() != null) evaluation.setRecommendation(dto.getRecommendation());
        evaluation.setComment(dto.getComment());

        return evaluationMapper.toDto(evaluationRepository.save(evaluation));
    }

    public EvaluationDto findByInterviewId(Long interviewId) {
        Evaluation evaluation = evaluationRepository.findByInterviewId(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable pour l'entretien : " + interviewId));
        return evaluationMapper.toDto(evaluation);
    }
}
