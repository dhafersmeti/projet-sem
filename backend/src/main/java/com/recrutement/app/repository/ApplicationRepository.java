package com.recrutement.app.repository;

import com.recrutement.app.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCandidateId(Long candidateId);

    List<Application> findByJobOfferId(Long jobOfferId);

    // Compte les candidatures non terminées (PENDING ou INTERVIEW)
    long countByStatusIn(List<Application.Status> statuses);
}
