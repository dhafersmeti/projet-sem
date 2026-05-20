package com.recrutement.app.dto;

import com.recrutement.app.entity.JobOffer;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class JobOfferDto {
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;
    private String requiredSkills;
    private LocalDateTime datePosted;
    private JobOffer.Status status;
    private long applicationCount;
}
