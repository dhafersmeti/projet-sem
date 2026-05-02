package com.recrutement.app.repository;

import com.recrutement.app.entity.JobOffer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long> {
}
