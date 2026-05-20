package com.recrutement.app.service;

import com.recrutement.app.dto.JobOfferDto;
import com.recrutement.app.entity.JobOffer;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.JobOfferMapper;
import com.recrutement.app.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@SuppressWarnings("null")
public class JobOfferService {

    private final JobOfferRepository jobOfferRepository;
    private final JobOfferMapper jobOfferMapper;

    public List<JobOfferDto> findAll() {
        return jobOfferRepository.findAll().stream()
                .map(jobOfferMapper::toDto)
                .collect(Collectors.toList());
    }

    public JobOfferDto findById(Long id) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable avec l'id : " + id));
        return jobOfferMapper.toDto(jobOffer);
    }

    public JobOfferDto create(JobOfferDto dto) {
        JobOffer jobOffer = jobOfferMapper.toEntity(dto);
        return jobOfferMapper.toDto(jobOfferRepository.save(jobOffer));
    }

    public JobOfferDto update(Long id, JobOfferDto dto) {
        JobOffer jobOffer = jobOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable avec l'id : " + id));
        jobOfferMapper.updateEntity(jobOffer, dto);
        return jobOfferMapper.toDto(jobOfferRepository.save(jobOffer));
    }

    public void delete(Long id) {
        if (!jobOfferRepository.existsById(id)) {
            throw new ResourceNotFoundException("Offre introuvable avec l'id : " + id);
        }
        jobOfferRepository.deleteById(id);
    }
}
