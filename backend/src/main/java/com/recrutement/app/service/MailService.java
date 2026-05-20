package com.recrutement.app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MailService {

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@recruittracker.com}")
    private String fromAddress;

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        if (!mailEnabled) {
            log.info("[MAIL LOG] ═══════════════════════════════");
            log.info("[MAIL LOG] À : {}", to);
            log.info("[MAIL LOG] Sujet : {}", subject);
            log.info("[MAIL LOG] Contenu :\n{}", htmlContent);
            log.info("[MAIL LOG] ═══════════════════════════════");
            return;
        }
        try {
            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress != null ? fromAddress : "noreply@recruittracker.com");
            helper.setTo(to != null ? to : "");
            helper.setSubject(subject != null ? subject : "");
            helper.setText(htmlContent != null ? htmlContent : "", true);
            mailSender.send(message);
            log.info("Email envoyé à {} : {}", to, subject);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email à {} : {}", to, e.getMessage());
        }
    }

    public void sendCredentials(String to, String name, String password) {
        String subject = "RecruitTracker — Vos identifiants de connexion";
        String html = "<div style='font-family:Calibri,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1F3864'>Bienvenue sur RecruitTracker</h2>"
                + "<p>Bonjour <strong>" + name + "</strong>,</p>"
                + "<p>Votre candidature a été enregistrée. Voici vos identifiants :</p>"
                + "<table style='border-collapse:collapse;width:100%'>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><strong>Email</strong></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + to + "</td></tr>"
                + "<tr><td style='padding:8px;border:1px solid #ddd'><strong>Mot de passe</strong></td>"
                + "<td style='padding:8px;border:1px solid #ddd'>" + password + "</td></tr>"
                + "</table>"
                + "<p>Connectez-vous sur <a href='http://localhost:5173'>RecruitTracker</a> "
                + "et changez votre mot de passe lors de votre première connexion.</p>"
                + "<p style='color:#7B2D26'><em>ITEAM University — RecruitTracker</em></p>"
                + "</div>";
        sendEmail(to, subject, html);
    }

    public void sendStatusChange(String to, String name, String jobTitle, String newStatus) {
        String subject = "RecruitTracker — Mise à jour de votre candidature";
        String html = "<div style='font-family:Calibri,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1F3864'>Mise à jour de votre candidature</h2>"
                + "<p>Bonjour <strong>" + name + "</strong>,</p>"
                + "<p>Le statut de votre candidature pour le poste <strong>" + jobTitle
                + "</strong> a été mis à jour.</p>"
                + "<p>Nouveau statut : <strong style='color:#5B9BD5'>" + newStatus + "</strong></p>"
                + "<p>Connectez-vous sur RecruitTracker pour suivre l'évolution de votre dossier.</p>"
                + "<p style='color:#7B2D26'><em>ITEAM University — RecruitTracker</em></p>"
                + "</div>";
        sendEmail(to, subject, html);
    }

    public void sendInterviewInvitation(String to, String name, String jobTitle,
                                        String date, String time, String location,
                                        String meetingLink, String instructions) {
        String subject = "RecruitTracker — Convocation à un entretien";
        String locationInfo = (meetingLink != null && !meetingLink.isBlank())
                ? "<a href='" + meetingLink + "'>Lien visioconférence</a>" : location;
        String html = "<div style='font-family:Calibri,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1F3864'>Convocation à un entretien</h2>"
                + "<p>Bonjour <strong>" + name + "</strong>,</p>"
                + "<p>Vous êtes convoqué(e) à un entretien pour le poste <strong>"
                + jobTitle + "</strong>.</p>"
                + "<ul><li><strong>Date :</strong> " + date + "</li>"
                + "<li><strong>Heure :</strong> " + time + "</li>"
                + "<li><strong>Lieu/Lien :</strong> " + locationInfo + "</li></ul>"
                + (instructions != null ? "<p><strong>Instructions :</strong> " + instructions + "</p>" : "")
                + "<p style='color:#7B2D26'><em>ITEAM University — RecruitTracker</em></p>"
                + "</div>";
        sendEmail(to, subject, html);
    }

    public void sendOfferEmbauche(String to, String name, String position,
                                   Double salary, String startDate) {
        String subject = "RecruitTracker — Offre d'embauche";
        String salaryInfo = salary != null ? String.format("%.0f TND/mois", salary) : "À négocier";
        String html = "<div style='font-family:Calibri,sans-serif;max-width:600px;margin:auto'>"
                + "<h2 style='color:#1F3864'>Félicitations !</h2>"
                + "<p>Bonjour <strong>" + name + "</strong>,</p>"
                + "<p>Nous avons le plaisir de vous proposer une offre d'embauche pour le poste de "
                + "<strong>" + position + "</strong>.</p>"
                + "<ul><li><strong>Salaire :</strong> " + salaryInfo + "</li>"
                + "<li><strong>Date de début :</strong> " + startDate + "</li></ul>"
                + "<p>Connectez-vous sur RecruitTracker pour accepter ou refuser l'offre.</p>"
                + "<p style='color:#7B2D26'><em>ITEAM University — RecruitTracker</em></p>"
                + "</div>";
        sendEmail(to, subject, html);
    }
}
