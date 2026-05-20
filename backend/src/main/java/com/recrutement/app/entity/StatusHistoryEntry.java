package com.recrutement.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history_entries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusHistoryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Enumerated(EnumType.STRING)
    private Application.Status oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Application.Status newStatus;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime changedAt;

    @Column
    private String changedBy;
}
