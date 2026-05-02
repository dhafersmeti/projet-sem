package com.recrutement.app.repository;

import com.recrutement.app.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    // Recherche par nom, email ou compétences (insensible à la casse)
    @Query("SELECT c FROM Candidate c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.skills) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Candidate> searchCandidates(@Param("search") String search);

    boolean existsByEmail(String email);

    Optional<Candidate> findByEmail(String email);
}
