package com.recrutement.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EvaluationDto {
    private Long id;

    @NotNull(message = "L'entretien est obligatoire")
    private Long interviewId;

    @NotNull(message = "Le score est obligatoire")
    @Min(value = 1, message = "Le score minimum est 1")
    @Max(value = 5, message = "Le score maximum est 5")
    private Integer score;

    private String comment;
}
