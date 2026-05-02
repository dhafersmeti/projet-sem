package com.recrutement.app.service;

import com.recrutement.app.dto.EvaluationDto;
import com.recrutement.app.entity.Evaluation;
import com.recrutement.app.entity.Interview;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.EvaluationMapper;
import com.recrutement.app.repository.EvaluationRepository;
import com.recrutement.app.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final InterviewRepository interviewRepository;
    private final EvaluationMapper evaluationMapper;

    public EvaluationDto create(EvaluationDto dto) {
        if (evaluationRepository.existsByInterviewId(dto.getInterviewId())) {
            throw new IllegalArgumentException("Une évaluation existe déjà pour cet entretien");
        }

        Interview interview = interviewRepository.findById(dto.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Entretien introuvable avec l'id : " + dto.getInterviewId()));

        Evaluation evaluation = Evaluation.builder()
                .interview(interview)
                .score(dto.getScore())
                .comment(dto.getComment())
                .build();

        return evaluationMapper.toDto(evaluationRepository.save(evaluation));
    }

    public EvaluationDto findByInterviewId(Long interviewId) {
        Evaluation evaluation = evaluationRepository.findByInterviewId(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable pour l'entretien : " + interviewId));
        return evaluationMapper.toDto(evaluation);
    }
}
