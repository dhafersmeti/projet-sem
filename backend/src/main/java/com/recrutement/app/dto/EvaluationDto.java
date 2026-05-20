package com.recrutement.app.dto;

import com.recrutement.app.entity.Evaluation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvaluationDto {
    private Long id;

    @NotNull(message = "L'entretien est obligatoire")
    private Long interviewId;

    @NotNull(message = "Le score de compétence est obligatoire")
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    private Integer competenceScore;

    @NotNull(message = "Le score d'attitude est obligatoire")
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    private Integer attitudeScore;

    @NotNull(message = "Le score de potentiel est obligatoire")
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    private Integer potentialScore;

    private double globalScore;

    private Evaluation.Recommendation recommendation;

    private String comment;
}
