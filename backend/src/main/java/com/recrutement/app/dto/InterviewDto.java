package com.recrutement.app.dto;

import com.recrutement.app.entity.Interview;
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

    private String location;
    private String meetingLink;
    private String preparationInstructions;
    private Interview.Status status;
    private boolean hasEvaluation;
}
