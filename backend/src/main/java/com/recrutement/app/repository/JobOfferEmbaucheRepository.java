package com.recrutement.app.repository;

import com.recrutement.app.entity.JobOfferEmbauche;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobOfferEmbaucheRepository extends JpaRepository<JobOfferEmbauche, Long> {

    Optional<JobOfferEmbauche> findByApplicationId(Long applicationId);

    boolean existsByApplicationId(Long applicationId);
}
