package com.recrutement.app.dto;

import com.recrutement.app.entity.Application;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ApplicationDto {
    private Long id;

    @NotNull(message = "Le candidat est obligatoire")
    private Long candidateId;

    private String candidateName;
    private String candidateEmail;

    @NotNull(message = "L'offre d'emploi est obligatoire")
    private Long jobOfferId;

    private String jobOfferTitle;
    private Application.Status status;
    private LocalDateTime appliedDate;
    private LocalDateTime updatedAt;
    private List<StatusHistoryEntryDto> statusHistory;
}
