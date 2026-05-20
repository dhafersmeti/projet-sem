package com.recrutement.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CandidateDto {
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    private String phone;
    private String skills;
    private String coverLetter;
    private String experiences;
    private String diplomas;
    private Long targetJobOfferId;
    private String targetJobOfferTitle;
    private String cvFileName;
    private LocalDateTime createdAt;
    private Long userId;
}
