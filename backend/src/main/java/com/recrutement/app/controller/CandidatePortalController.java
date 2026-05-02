package com.recrutement.app.controller;

import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.Candidate;
import com.recrutement.app.entity.Evaluation;
import com.recrutement.app.entity.Interview;
import com.recrutement.app.entity.User;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.CandidateRepository;
import com.recrutement.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CandidatePortalController {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;

    private Candidate resolveCandidate(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return candidateRepository.findById(user.getCandidateId()).orElseThrow();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", c.getId());
        profile.put("name", c.getName());
        profile.put("email", c.getEmail());
        profile.put("phone", c.getPhone());
        profile.put("skills", c.getSkills());
        profile.put("cvFileName", c.getCvFileName());
        profile.put("createdAt", c.getCreatedAt());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Application> apps = applicationRepository.findByCandidateId(c.getId());
        List<Map<String, Object>> result = apps.stream()
                .map(this::mapApplication)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id, Authentication auth) {
        Candidate c = resolveCandidate(auth);
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        if (!app.getCandidate().getId().equals(c.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(mapApplication(app));
    }

    private Map<String, Object> mapApplication(Application app) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", app.getId());
        m.put("jobOfferId", app.getJobOffer().getId());
        m.put("jobOfferTitle", app.getJobOffer().getTitle());
        m.put("jobOfferDescription", app.getJobOffer().getDescription());
        m.put("status", app.getStatus().name());
        m.put("appliedDate", app.getAppliedDate());

        List<Map<String, Object>> interviews = app.getInterviews().stream()
                .map(this::mapInterview)
                .collect(Collectors.toList());
        m.put("interviews", interviews);

        return m;
    }

    private Map<String, Object> mapInterview(Interview iv) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", iv.getId());
        m.put("date", iv.getDate());
        m.put("time", iv.getTime());
        m.put("location", iv.getLocation());

        Evaluation eval = iv.getEvaluation();
        if (eval != null) {
            Map<String, Object> evalMap = new LinkedHashMap<>();
            evalMap.put("score", eval.getScore());
            evalMap.put("comment", eval.getComment());
            m.put("evaluation", evalMap);
        } else {
            m.put("evaluation", null);
        }

        return m;
    }
}
