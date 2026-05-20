package com.recrutement.app.controller;

import com.recrutement.app.dto.JobOfferEmbaucheDto;
import com.recrutement.app.entity.*;
import com.recrutement.app.repository.*;
import com.recrutement.app.service.NotificationService;
import com.recrutement.app.service.OfferEmbaucheService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class CandidatePortalController {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final JobOfferRepository jobOfferRepository;
    private final NotificationService notificationService;
    private final OfferEmbaucheService offerEmbaucheService;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    private Candidate resolveCandidate(Authentication auth) {
        User user = resolveUser(auth);
        Long candidateId = Objects.requireNonNull(user.getCandidateId(), "Utilisateur sans profil candidat");
        return candidateRepository.findById(candidateId).orElseThrow();
    }

    // ── Profil ───────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", c.getId());
        profile.put("name", c.getName());
        profile.put("email", c.getEmail());
        profile.put("phone", c.getPhone());
        profile.put("skills", c.getSkills());
        profile.put("coverLetter", c.getCoverLetter());
        profile.put("experiences", c.getExperiences());
        profile.put("diplomas", c.getDiplomas());
        profile.put("cvFileName", c.getCvFileName());
        profile.put("createdAt", c.getCreatedAt());
        if (c.getTargetJobOffer() != null) {
            profile.put("targetJobOfferId", c.getTargetJobOffer().getId());
            profile.put("targetJobOfferTitle", c.getTargetJobOffer().getTitle());
        }

        List<Application> apps = applicationRepository.findByCandidateId(c.getId());
        Application mainApp = apps.isEmpty() ? null : apps.get(0);
        if (mainApp != null) {
            profile.put("currentStatus", mainApp.getStatus().name());
            profile.put("applicationId", mainApp.getId());
        }

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    @Transactional
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Authentication auth) {
        Candidate c = resolveCandidate(auth);
        if (body.containsKey("phone")) c.setPhone(body.get("phone"));
        if (body.containsKey("skills")) c.setSkills(body.get("skills"));
        if (body.containsKey("coverLetter")) c.setCoverLetter(body.get("coverLetter"));
        if (body.containsKey("experiences")) c.setExperiences(body.get("experiences"));
        if (body.containsKey("diplomas")) c.setDiplomas(body.get("diplomas"));
        candidateRepository.save(c);
        return ResponseEntity.ok(Map.of("message", "Profil mis à jour"));
    }

    @PostMapping("/me/cv")
    @Transactional
    public ResponseEntity<?> uploadCv(@RequestParam("file") MultipartFile file,
                                       Authentication auth) throws IOException {
        Candidate c = resolveCandidate(auth);
        if (file.getContentType() == null || !file.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Seuls les fichiers PDF sont acceptés"));
        }
        java.nio.file.Path uploadPath = Paths.get("uploads/cvs");
        if (!java.nio.file.Files.exists(uploadPath)) java.nio.file.Files.createDirectories(uploadPath);
        String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueName);
        java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        c.setCvFileName(file.getOriginalFilename());
        c.setCvFilePath(filePath.toString());
        candidateRepository.save(c);
        return ResponseEntity.ok(Map.of("fileName", file.getOriginalFilename()));
    }

    @GetMapping("/me/cv")
    public ResponseEntity<Resource> downloadCv(Authentication auth) throws IOException {
        Candidate c = resolveCandidate(auth);
        if (c.getCvFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        Path filePath = Paths.get(c.getCvFilePath());
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + c.getCvFileName() + "\"")
                .body(resource);
    }

    // ── Candidature ──────────────────────────────────────────────────────────

    @GetMapping("/me/application")
    public ResponseEntity<?> getApplication(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Application> apps = applicationRepository.findByCandidateId(c.getId());
        if (apps.isEmpty()) return ResponseEntity.ok(null);
        Application app = apps.get(0);
        return ResponseEntity.ok(mapApplication(app, true));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Map<String, Object>> result = applicationRepository.findByCandidateId(c.getId())
                .stream().map(a -> mapApplication(a, false)).collect(Collectors.toList());
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
        return ResponseEntity.ok(mapApplication(app, true));
    }

    // ── Entretiens ────────────────────────────────────────────────────────────

    @GetMapping("/me/interviews")
    public ResponseEntity<?> getInterviews(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Map<String, Object>> interviews = applicationRepository.findByCandidateId(c.getId())
                .stream()
                .flatMap(app -> app.getInterviews().stream())
                .map(this::mapInterview)
                .collect(Collectors.toList());
        return ResponseEntity.ok(interviews);
    }

    // ── Notifications ─────────────────────────────────────────────────────────

    @GetMapping("/me/notifications")
    public ResponseEntity<?> getNotifications(Authentication auth) {
        User user = resolveUser(auth);
        return ResponseEntity.ok(notificationService.getForUser(user.getId()));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication auth) {
        User user = resolveUser(auth);
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(user.getId())));
    }

    @PutMapping("/me/notifications/{id}/read")
    @Transactional
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        User user = resolveUser(auth);
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/notifications/read-all")
    @Transactional
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        User user = resolveUser(auth);
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    // ── Offre d'embauche ─────────────────────────────────────────────────────

    @GetMapping("/me/offer")
    public ResponseEntity<?> getOffer(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Application> apps = applicationRepository.findByCandidateId(c.getId());
        if (apps.isEmpty()) return ResponseEntity.ok(null);
        try {
            JobOfferEmbaucheDto dto = offerEmbaucheService.findByApplicationId(apps.get(0).getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    @PostMapping("/me/offer/accept")
    @Transactional
    public ResponseEntity<?> acceptOffer(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Application> apps = applicationRepository.findByCandidateId(c.getId());
        if (apps.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Aucune candidature trouvée"));
        JobOfferEmbaucheDto dto = offerEmbaucheService.acceptOffer(apps.get(0).getId());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/me/offer/reject")
    @Transactional
    public ResponseEntity<?> rejectOffer(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Application> apps = applicationRepository.findByCandidateId(c.getId());
        if (apps.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Aucune candidature trouvée"));
        JobOfferEmbaucheDto dto = offerEmbaucheService.rejectOffer(apps.get(0).getId());
        return ResponseEntity.ok(dto);
    }

    // ── Offres d'emploi ───────────────────────────────────────────────────────

    @GetMapping("/job-offers")
    public ResponseEntity<?> getJobOffers(Authentication auth) {
        Candidate c = resolveCandidate(auth);
        List<Long> appliedOfferIds = applicationRepository.findByCandidateId(c.getId())
                .stream().map(a -> a.getJobOffer().getId()).collect(Collectors.toList());

        List<Map<String, Object>> offers = jobOfferRepository.findAll().stream()
                .filter(o -> o.getStatus() == JobOffer.Status.PUBLISHED)
                .map(offer -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", offer.getId());
                    m.put("title", offer.getTitle());
                    m.put("description", offer.getDescription());
                    m.put("requiredSkills", offer.getRequiredSkills());
                    m.put("datePosted", offer.getDatePosted());
                    m.put("status", offer.getStatus().name());
                    m.put("alreadyApplied", appliedOfferIds.contains(offer.getId()));
                    return m;
                }).collect(Collectors.toList());

        return ResponseEntity.ok(offers);
    }

    @PostMapping("/job-offers/{jobOfferId}/apply")
    @Transactional
    public ResponseEntity<?> applyToOffer(@PathVariable Long jobOfferId, Authentication auth) {
        Candidate c = resolveCandidate(auth);
        JobOffer offer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        if (offer.getStatus() == JobOffer.Status.CLOSED) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cette offre est clôturée."));
        }

        boolean alreadyApplied = applicationRepository.findByCandidateId(c.getId())
                .stream().anyMatch(a -> a.getJobOffer().getId().equals(jobOfferId));
        if (alreadyApplied) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vous avez déjà postulé à cette offre."));
        }

        Application app = Application.builder()
                .candidate(c).jobOffer(offer).status(Application.Status.RECEIVED).build();
        applicationRepository.save(app);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Candidature envoyée avec succès."));
    }

    // ── Helpers mapping ───────────────────────────────────────────────────────

    private Map<String, Object> mapApplication(Application app, boolean includeHistory) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", app.getId());
        m.put("jobOfferId", app.getJobOffer().getId());
        m.put("jobOfferTitle", app.getJobOffer().getTitle());
        m.put("jobOfferDescription", app.getJobOffer().getDescription());
        m.put("status", app.getStatus().name());
        m.put("appliedDate", app.getAppliedDate());

        List<Map<String, Object>> interviews = app.getInterviews().stream()
                .map(this::mapInterview).collect(Collectors.toList());
        m.put("interviews", interviews);

        if (includeHistory) {
            List<Map<String, Object>> history = app.getStatusHistory().stream()
                    .map(h -> {
                        Map<String, Object> hm = new LinkedHashMap<>();
                        hm.put("oldStatus", h.getOldStatus() != null ? h.getOldStatus().name() : null);
                        hm.put("newStatus", h.getNewStatus().name());
                        hm.put("changedAt", h.getChangedAt());
                        hm.put("changedBy", h.getChangedBy());
                        return hm;
                    }).collect(Collectors.toList());
            m.put("statusHistory", history);
        }

        return m;
    }

    private Map<String, Object> mapInterview(Interview iv) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", iv.getId());
        m.put("date", iv.getDate());
        m.put("time", iv.getTime());
        m.put("location", iv.getLocation());
        m.put("meetingLink", iv.getMeetingLink());
        m.put("preparationInstructions", iv.getPreparationInstructions());
        m.put("status", iv.getStatus().name());

        Evaluation eval = iv.getEvaluation();
        if (eval != null) {
            Map<String, Object> evalMap = new LinkedHashMap<>();
            evalMap.put("competenceScore", eval.getCompetenceScore());
            evalMap.put("attitudeScore", eval.getAttitudeScore());
            evalMap.put("potentialScore", eval.getPotentialScore());
            evalMap.put("globalScore", eval.getGlobalScore());
            evalMap.put("recommendation", eval.getRecommendation().name());
            evalMap.put("comment", eval.getComment());
            m.put("evaluation", evalMap);
        } else {
            m.put("evaluation", null);
        }

        return m;
    }
}
