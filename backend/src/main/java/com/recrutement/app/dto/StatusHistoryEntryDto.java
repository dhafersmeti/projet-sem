package com.recrutement.app.dto;

import com.recrutement.app.entity.Application;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StatusHistoryEntryDto {
    private Long id;
    private Application.Status oldStatus;
    private Application.Status newStatus;
    private LocalDateTime changedAt;
    private String changedBy;
}
