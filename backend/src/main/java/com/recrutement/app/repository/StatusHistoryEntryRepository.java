package com.recrutement.app.repository;

import com.recrutement.app.entity.StatusHistoryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StatusHistoryEntryRepository extends JpaRepository<StatusHistoryEntry, Long> {

    List<StatusHistoryEntry> findByApplicationIdOrderByChangedAtDesc(Long applicationId);
}
