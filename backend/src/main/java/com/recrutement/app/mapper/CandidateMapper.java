package com.recrutement.app.mapper;

import com.recrutement.app.dto.CandidateDto;
import com.recrutement.app.entity.Candidate;
import org.springframework.stereotype.Component;

@Component
public class CandidateMapper {

    public CandidateDto toDto(Candidate candidate) {
        CandidateDto dto = new CandidateDto();
        dto.setId(candidate.getId());
        dto.setName(candidate.getName());
        dto.setEmail(candidate.getEmail());
        dto.setPhone(candidate.getPhone());
        dto.setSkills(candidate.getSkills());
        dto.setCvFileName(candidate.getCvFileName());
        dto.setCreatedAt(candidate.getCreatedAt());
        return dto;
    }

    public Candidate toEntity(CandidateDto dto) {
        Candidate candidate = new Candidate();
        candidate.setName(dto.getName());
        candidate.setEmail(dto.getEmail());
        candidate.setPhone(dto.getPhone());
        candidate.setSkills(dto.getSkills());
        return candidate;
    }

    public void updateEntity(Candidate candidate, CandidateDto dto) {
        candidate.setName(dto.getName());
        candidate.setEmail(dto.getEmail());
        candidate.setPhone(dto.getPhone());
        candidate.setSkills(dto.getSkills());
    }
}
