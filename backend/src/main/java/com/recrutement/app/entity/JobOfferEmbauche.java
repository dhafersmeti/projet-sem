package com.recrutement.app.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_offer_embauches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobOfferEmbauche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(nullable = false)
    private String position;

    private Double salary;

    private LocalDate startDate;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.PENDING;

    private String pdfPath;

    public enum Status {
        PENDING, SENT, ACCEPTED, REJECTED
    }
}
