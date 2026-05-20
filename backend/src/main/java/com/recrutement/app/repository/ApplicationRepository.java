package com.recrutement.app.repository;

import com.recrutement.app.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByCandidateId(Long candidateId);

    List<Application> findByJobOfferId(Long jobOfferId);

    long countByStatusIn(List<Application.Status> statuses);

    long countByStatus(Application.Status status);

    List<Application> findByStatus(Application.Status status);

    List<Application> findByJobOfferIdOrderByUpdatedAtDesc(Long jobOfferId);

    @Query(value = "SELECT AVG(DATEDIFF(updated_at, applied_date)) FROM applications " +
                   "WHERE status IN ('ACCEPTED', 'REJECTED') AND updated_at IS NOT NULL",
           nativeQuery = true)
    Double findAverageRecruitmentDays();
}
