package com.recrutement.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "evaluations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    @Column(nullable = false)
    private int competenceScore;

    @Column(nullable = false)
    private int attitudeScore;

    @Column(nullable = false)
    private int potentialScore;

    @Column(nullable = false)
    private double globalScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Recommendation recommendation = Recommendation.REJECT;

    @Column(columnDefinition = "TEXT")
    private String comment;

    public enum Recommendation {
        HIRE, REJECT
    }

    @PrePersist
    @PreUpdate
    public void computeGlobalScore() {
        this.globalScore = (competenceScore + attitudeScore + potentialScore) / 3.0;
    }
}
