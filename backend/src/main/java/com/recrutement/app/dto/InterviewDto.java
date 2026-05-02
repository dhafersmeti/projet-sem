package com.recrutement.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class InterviewDto {
    private Long id;

    @NotNull(message = "La candidature est obligatoire")
    private Long applicationId;

    private String candidateName;
    private String jobOfferTitle;

    @NotNull(message = "La date est obligatoire")
    private LocalDate date;

    @NotNull(message = "L'heure est obligatoire")
    private LocalTime time;

    @NotBlank(message = "Le lieu est obligatoire")
    private String location;

    private boolean hasEvaluation;
}
