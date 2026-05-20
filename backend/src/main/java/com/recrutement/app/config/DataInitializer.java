package com.recrutement.app.config;

import com.recrutement.app.entity.*;
import com.recrutement.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
@Slf4j
@Transactional
@SuppressWarnings("null")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final JobOfferRepository jobOfferRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final EvaluationRepository evaluationRepository;
    private final StatusHistoryEntryRepository statusHistoryEntryRepository;
    private final JobOfferEmbaucheRepository jobOfferEmbaucheRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@iteam.tn")) {
            log.info("Données de démonstration déjà présentes — démarrage normal.");
            return;
        }

        log.info("=== Initialisation des données de démonstration RecruitTracker ===");

        // ── ADMIN ────────────────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
                .name("Administrateur ITEAM")
                .email("admin@iteam.tn")
                .password(passwordEncoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .firstLogin(false).enabled(true)
                .build());

        // ── RECRUTEURS ───────────────────────────────────────────────────────
        userRepository.save(User.builder()
                .name("Recruteur Takoua")
                .email("recruteur1@iteam.tn")
                .password(passwordEncoder.encode("recruiter123"))
                .role(User.Role.RECRUITER)
                .firstLogin(false).enabled(true)
                .build());

        userRepository.save(User.builder()
                .name("Recruteur Dhafer")
                .email("recruteur2@iteam.tn")
                .password(passwordEncoder.encode("recruiter123"))
                .role(User.Role.RECRUITER)
                .firstLogin(false).enabled(true)
                .build());

        // ── OFFRES D'EMPLOI ───────────────────────────────────────────────────
        JobOffer offerJava = jobOfferRepository.save(JobOffer.builder()
                .title("Développeur Java Junior")
                .description("Nous recherchons un développeur Java passionné pour rejoindre notre équipe backend.")
                .requiredSkills("Java, Spring Boot, MySQL, REST API, Git")
                .status(JobOffer.Status.PUBLISHED)
                .build());

        JobOffer offerReact = jobOfferRepository.save(JobOffer.builder()
                .title("Développeur React Junior")
                .description("Rejoignez notre équipe frontend pour créer des interfaces modernes et réactives.")
                .requiredSkills("React, JavaScript, TypeScript, Tailwind CSS, Git")
                .status(JobOffer.Status.PUBLISHED)
                .build());

        JobOffer offerDevOps = jobOfferRepository.save(JobOffer.builder()
                .title("Stagiaire DevOps")
                .description("Stage de 3 mois pour découvrir les pratiques CI/CD, Docker et Kubernetes.")
                .requiredSkills("Linux, Docker, Git, CI/CD, notions réseau")
                .status(JobOffer.Status.PUBLISHED)
                .build());

        // ── CANDIDAT 1 : RECEIVED ─────────────────────────────────────────────
        Candidate c1 = createCandidate("Ahmed Ben Ali", "ahmed.benali@email.com",
                "+216 22 111 000", "Java, Spring Boot, SQL",
                "Je suis passionné par le développement backend.", offerJava);
        User u1 = createCandidateUser("ahmed.benali@email.com", c1);
        Application app1 = createApplication(c1, offerJava, Application.Status.RECEIVED, u1.getEmail());
        createHistory(app1, null, Application.Status.RECEIVED, "system");

        // ── CANDIDAT 2 : INTERVIEW dans 3 jours ──────────────────────────────
        Candidate c2 = createCandidate("Sarra Mansour", "sarra.mansour@email.com",
                "+216 22 222 111", "React, TypeScript, CSS",
                "Développeuse frontend avec 1 an d'expérience freelance.", offerReact);
        User u2 = createCandidateUser("sarra.mansour@email.com", c2);
        Application app2 = createApplication(c2, offerReact, Application.Status.INTERVIEW, u2.getEmail());
        createHistory(app2, null, Application.Status.RECEIVED, "system");
        createHistory(app2, Application.Status.RECEIVED, Application.Status.UNDER_REVIEW, "recruteur1@iteam.tn");
        createHistory(app2, Application.Status.UNDER_REVIEW, Application.Status.INTERVIEW, "recruteur1@iteam.tn");
        interviewRepository.save(Interview.builder()
                .application(app2)
                .date(LocalDate.now().plusDays(3))
                .time(LocalTime.of(10, 0))
                .location("Salle de réunion A, ITEAM University")
                .meetingLink("https://meet.google.com/abc-defg-hij")
                .preparationInstructions("Préparez un mini-projet React (composant liste + formulaire). Durée : 30 min.")
                .status(Interview.Status.PLANNED)
                .build());

        // ── CANDIDAT 3 : EVALUATION (évaluation enregistrée) ─────────────────
        Candidate c3 = createCandidate("Yassine Trabelsi", "yassine.trabelsi@email.com",
                "+216 22 333 222", "Docker, Linux, Git, CI/CD",
                "Passionné par l'automatisation et les infrastructures cloud.", offerDevOps);
        User u3 = createCandidateUser("yassine.trabelsi@email.com", c3);
        Application app3 = createApplication(c3, offerDevOps, Application.Status.EVALUATION, u3.getEmail());
        createHistory(app3, null, Application.Status.RECEIVED, "system");
        createHistory(app3, Application.Status.RECEIVED, Application.Status.UNDER_REVIEW, "recruteur2@iteam.tn");
        createHistory(app3, Application.Status.UNDER_REVIEW, Application.Status.INTERVIEW, "recruteur2@iteam.tn");
        createHistory(app3, Application.Status.INTERVIEW, Application.Status.EVALUATION, "recruteur2@iteam.tn");
        Interview iv3 = interviewRepository.save(Interview.builder()
                .application(app3)
                .date(LocalDate.now().minusDays(5))
                .time(LocalTime.of(14, 0))
                .location("Salle de réunion B")
                .status(Interview.Status.COMPLETED)
                .build());
        Evaluation eval3 = Evaluation.builder()
                .interview(iv3)
                .competenceScore(4).attitudeScore(5).potentialScore(4)
                .recommendation(Evaluation.Recommendation.HIRE)
                .comment("Excellent candidat, très motivé et compétent en DevOps.")
                .build();
        evaluationRepository.save(eval3);

        // ── CANDIDAT 4 : ACCEPTED + offre générée ────────────────────────────
        Candidate c4 = createCandidate("Rim Chaabani", "rim.chaabani@email.com",
                "+216 22 444 333", "Java, Spring Boot, Microservices, Docker",
                "4 ans d'expérience en développement Java entreprise.", offerJava);
        User u4 = createCandidateUser("rim.chaabani@email.com", c4);
        Application app4 = createApplication(c4, offerJava, Application.Status.ACCEPTED, u4.getEmail());
        createHistory(app4, null, Application.Status.RECEIVED, "system");
        createHistory(app4, Application.Status.RECEIVED, Application.Status.UNDER_REVIEW, "recruteur1@iteam.tn");
        createHistory(app4, Application.Status.UNDER_REVIEW, Application.Status.INTERVIEW, "recruteur1@iteam.tn");
        createHistory(app4, Application.Status.INTERVIEW, Application.Status.EVALUATION, "recruteur1@iteam.tn");
        createHistory(app4, Application.Status.EVALUATION, Application.Status.ACCEPTED, "recruteur1@iteam.tn");
        Interview iv4 = interviewRepository.save(Interview.builder()
                .application(app4)
                .date(LocalDate.now().minusDays(10))
                .time(LocalTime.of(11, 0))
                .location("Salle principale")
                .status(Interview.Status.COMPLETED)
                .build());
        Evaluation eval4 = Evaluation.builder()
                .interview(iv4)
                .competenceScore(5).attitudeScore(5).potentialScore(5)
                .recommendation(Evaluation.Recommendation.HIRE)
                .comment("Profil exceptionnel. Recrutement fortement recommandé.")
                .build();
        evaluationRepository.save(eval4);
        jobOfferEmbaucheRepository.save(JobOfferEmbauche.builder()
                .application(app4)
                .position("Développeur Java Junior")
                .salary(2500.0)
                .startDate(LocalDate.now().plusMonths(1))
                .benefits("Tickets restaurant, mutuelle, télétravail 2j/semaine")
                .status(JobOfferEmbauche.Status.SENT)
                .build());

        // ── CANDIDAT 5 : REJECTED ─────────────────────────────────────────────
        Candidate c5 = createCandidate("Khalil Boukadida", "khalil.boukadida@email.com",
                "+216 22 555 444", "React, JavaScript",
                "Junior developer looking for first opportunity.", offerReact);
        User u5 = createCandidateUser("khalil.boukadida@email.com", c5);
        Application app5 = createApplication(c5, offerReact, Application.Status.REJECTED, u5.getEmail());
        createHistory(app5, null, Application.Status.RECEIVED, "system");
        createHistory(app5, Application.Status.RECEIVED, Application.Status.UNDER_REVIEW, "recruteur2@iteam.tn");
        createHistory(app5, Application.Status.UNDER_REVIEW, Application.Status.REJECTED, "recruteur2@iteam.tn");

        log.info("=== Données de démonstration créées avec succès ===");
        log.info("ADMIN     : admin@iteam.tn / admin123");
        log.info("RECRUTEUR : recruteur1@iteam.tn / recruiter123");
        log.info("RECRUTEUR : recruteur2@iteam.tn / recruiter123");
        log.info("CANDIDATS : ahmed.benali@email.com / candidate123 (RECEIVED)");
        log.info("CANDIDATS : sarra.mansour@email.com / candidate123 (INTERVIEW)");
        log.info("CANDIDATS : yassine.trabelsi@email.com / candidate123 (EVALUATION)");
        log.info("CANDIDATS : rim.chaabani@email.com / candidate123 (ACCEPTED + offre)");
        log.info("CANDIDATS : khalil.boukadida@email.com / candidate123 (REJECTED)");
    }

    private Candidate createCandidate(String name, String email, String phone,
                                       String skills, String coverLetter, JobOffer targetOffer) {
        return candidateRepository.save(Candidate.builder()
                .name(name).email(email).phone(phone)
                .skills(skills).coverLetter(coverLetter)
                .targetJobOffer(targetOffer)
                .build());
    }

    private User createCandidateUser(String email, Candidate candidate) {
        User user = userRepository.save(User.builder()
                .name(candidate.getName())
                .email(email)
                .password(passwordEncoder.encode("candidate123"))
                .role(User.Role.CANDIDATE)
                .candidateId(candidate.getId())
                .firstLogin(false)
                .enabled(true)
                .build());
        candidate.setUser(user);
        candidateRepository.save(candidate);
        return user;
    }

    private Application createApplication(Candidate candidate, JobOffer jobOffer,
                                           Application.Status status, String changedBy) {
        return applicationRepository.save(Application.builder()
                .candidate(candidate).jobOffer(jobOffer).status(status)
                .build());
    }

    private void createHistory(Application app, Application.Status oldStatus,
                                Application.Status newStatus, String changedBy) {
        statusHistoryEntryRepository.save(StatusHistoryEntry.builder()
                .application(app).oldStatus(oldStatus).newStatus(newStatus).changedBy(changedBy)
                .build());
    }
}
