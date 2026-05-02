package com.recrutement.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "interviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime time;

    @Column(nullable = false)
    private String location;

    @OneToOne(mappedBy = "interview", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Evaluation evaluation;
}
