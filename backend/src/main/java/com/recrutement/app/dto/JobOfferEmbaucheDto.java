package com.recrutement.app.dto;

import com.recrutement.app.entity.JobOfferEmbauche;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class JobOfferEmbaucheDto {
    private Long id;
    private Long applicationId;
    private String candidateName;
    private String candidateEmail;

    @NotBlank(message = "Le poste est obligatoire")
    private String position;

    private Double salary;
    private LocalDate startDate;
    private String benefits;
    private LocalDateTime generatedAt;
    private JobOfferEmbauche.Status status;
    private boolean hasPdf;
}
