package com.recrutement.app.service;

import com.recrutement.app.dto.InterviewDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.Interview;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.mapper.InterviewMapper;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@SuppressWarnings("null")
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewMapper interviewMapper;
    private final NotificationService notificationService;

    public List<InterviewDto> findAll() {
        return interviewRepository.findAll().stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    public InterviewDto findById(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entretien introuvable avec l'id : " + id));
        return interviewMapper.toDto(interview);
    }

    public InterviewDto create(InterviewDto dto) {
        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable avec l'id : " + dto.getApplicationId()));

        Interview interview = Interview.builder()
                .application(application)
                .date(dto.getDate())
                .time(dto.getTime())
                .location(dto.getLocation())
                .meetingLink(dto.getMeetingLink())
                .preparationInstructions(dto.getPreparationInstructions())
                .status(Interview.Status.PLANNED)
                .build();

        Interview saved = interviewRepository.save(interview);

        application.setStatus(Application.Status.INTERVIEW);
        applicationRepository.save(application);

        notificationService.createForInterview(saved);

        log.info("Entretien créé pour candidature #{}", dto.getApplicationId());
        return interviewMapper.toDto(saved);
    }

    public InterviewDto update(Long id, InterviewDto dto) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entretien introuvable avec l'id : " + id));
        interview.setDate(dto.getDate());
        interview.setTime(dto.getTime());
        interview.setLocation(dto.getLocation());
        interview.setMeetingLink(dto.getMeetingLink());
        interview.setPreparationInstructions(dto.getPreparationInstructions());
        if (dto.getStatus() != null) interview.setStatus(dto.getStatus());
        return interviewMapper.toDto(interviewRepository.save(interview));
    }

    public void delete(Long id) {
        if (!interviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Entretien introuvable avec l'id : " + id);
        }
        interviewRepository.deleteById(id);
    }

    public List<InterviewDto> findByApplicationId(Long applicationId) {
        return interviewRepository.findAll().stream()
                .filter(i -> i.getApplication().getId().equals(applicationId))
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }
}
