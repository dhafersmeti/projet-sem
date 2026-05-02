package com.recrutement.app.repository;

import com.recrutement.app.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByInterviewId(Long interviewId);
    boolean existsByInterviewId(Long interviewId);
}
