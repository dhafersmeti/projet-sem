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

    // Score de 1 à 5
    @Column(nullable = false)
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
