package com.recrutement.app.service;

import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.Interview;
import com.recrutement.app.entity.Notification;
import com.recrutement.app.repository.NotificationRepository;
import com.recrutement.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    public void createForStatusChange(Application application, Application.Status newStatus) {
        Long userId = resolveUserId(application.getCandidate().getId());
        if (userId == null) return;

        String jobTitle = application.getJobOffer().getTitle();
        String candidateName = application.getCandidate().getName();
        String candidateEmail = application.getCandidate().getEmail();
        String statusLabel = statusLabel(newStatus);

        String title = "Statut de candidature mis à jour";
        String message = "Votre candidature pour \"" + jobTitle + "\" est maintenant : " + statusLabel;

        saveNotification(userId, title, message, Notification.Type.STATUS_CHANGE, application.getId());

        mailService.sendStatusChange(candidateEmail, candidateName, jobTitle, statusLabel);
    }

    public void createForInterview(Interview interview) {
        Application app = interview.getApplication();
        Long userId = resolveUserId(app.getCandidate().getId());
        if (userId == null) return;

        String jobTitle = app.getJobOffer().getTitle();
        String candidateName = app.getCandidate().getName();
        String candidateEmail = app.getCandidate().getEmail();

        String title = "Convocation à un entretien";
        String message = "Vous êtes convoqué(e) à un entretien pour \"" + jobTitle
                + "\" le " + interview.getDate() + " à " + interview.getTime();

        saveNotification(userId, title, message, Notification.Type.INTERVIEW, interview.getId());

        mailService.sendInterviewInvitation(
                candidateEmail, candidateName, jobTitle,
                interview.getDate().toString(),
                interview.getTime().toString(),
                interview.getLocation(),
                interview.getMeetingLink(),
                interview.getPreparationInstructions()
        );
    }

    public void sendCredentials(Long userId, String email, String name, String rawPassword) {
        String title = "Vos identifiants RecruitTracker";
        String message = "Votre compte a été créé. Email : " + email + " / Mot de passe : " + rawPassword;

        saveNotification(userId, title, message, Notification.Type.CREDENTIALS, null);

        mailService.sendCredentials(email, name, rawPassword);
    }

    public void createForOffer(Application application) {
        Long userId = resolveUserId(application.getCandidate().getId());
        if (userId == null) return;

        String title = "Offre d'embauche disponible";
        String message = "Une offre d'embauche pour \"" + application.getJobOffer().getTitle()
                + "\" vous a été envoyée. Consultez votre espace candidat.";

        saveNotification(userId, title, message, Notification.Type.OFFER, application.getId());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(n -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", n.getId());
                    m.put("title", n.getTitle());
                    m.put("message", n.getMessage());
                    m.put("type", n.getType().name());
                    m.put("read", n.isRead());
                    m.put("createdAt", n.getCreatedAt());
                    m.put("relatedEntityId", n.getRelatedEntityId());
                    return m;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
            }
        });
    }

    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(n -> n.setRead(true));
    }

    private void saveNotification(Long userId, String title, String message,
                                   Notification.Type type, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .build();
        notificationRepository.save(notification);
        log.debug("Notification créée pour user={} : {}", userId, title);
    }

    private Long resolveUserId(Long candidateId) {
        return userRepository.findByCandidateId(candidateId)
                .map(u -> u.getId())
                .orElse(null);
    }

    private String statusLabel(Application.Status status) {
        return switch (status) {
            case RECEIVED -> "Reçu";
            case UNDER_REVIEW -> "En examen";
            case INTERVIEW -> "Entretien";
            case EVALUATION -> "Évaluation";
            case ACCEPTED -> "Accepté";
            case REJECTED -> "Refusé";
        };
    }
}
