package com.recrutement.app.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.recrutement.app.dto.JobOfferEmbaucheDto;
import com.recrutement.app.entity.Application;
import com.recrutement.app.entity.JobOfferEmbauche;
import com.recrutement.app.exception.ResourceNotFoundException;
import com.recrutement.app.repository.ApplicationRepository;
import com.recrutement.app.repository.JobOfferEmbaucheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@SuppressWarnings("null")
public class OfferEmbaucheService {

    private final JobOfferEmbaucheRepository offerEmbaucheRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;
    private final MailService mailService;

    @Value("${app.upload.dir:uploads/cvs}")
    private String uploadDir;

    @Value("${app.offer.dir:uploads/offers}")
    private String offerDir;

    public JobOfferEmbaucheDto create(Long applicationId, JobOfferEmbaucheDto dto) {
        if (offerEmbaucheRepository.existsByApplicationId(applicationId)) {
            throw new IllegalArgumentException("Une offre d'embauche existe déjà pour cette candidature");
        }

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature introuvable : " + applicationId));

        if (application.getStatus() != Application.Status.ACCEPTED) {
            throw new IllegalArgumentException("La candidature doit être acceptée pour générer une offre d'embauche");
        }

        JobOfferEmbauche offer = JobOfferEmbauche.builder()
                .application(application)
                .position(dto.getPosition())
                .salary(dto.getSalary())
                .startDate(dto.getStartDate())
                .benefits(dto.getBenefits())
                .status(JobOfferEmbauche.Status.PENDING)
                .build();

        JobOfferEmbauche saved = offerEmbaucheRepository.save(offer);

        try {
            byte[] pdf = generatePdfBytes(saved);
            Path dirPath = Paths.get(offerDir);
            if (!Files.exists(dirPath)) Files.createDirectories(dirPath);
            String fileName = "offer_" + saved.getId() + ".pdf";
            Path pdfPath = dirPath.resolve(fileName);
            Files.write(pdfPath, pdf);
            saved.setPdfPath(pdfPath.toString());
            saved.setStatus(JobOfferEmbauche.Status.SENT);
            offerEmbaucheRepository.save(saved);
        } catch (IOException e) {
            log.error("Erreur génération PDF offre #{} : {}", saved.getId(), e.getMessage());
        }

        notificationService.createForOffer(application);

        String candidateEmail = application.getCandidate().getEmail();
        String candidateName = application.getCandidate().getName();
        String startDateStr = dto.getStartDate() != null ? dto.getStartDate().toString() : "À définir";
        mailService.sendOfferEmbauche(candidateEmail, candidateName, dto.getPosition(), dto.getSalary(), startDateStr);

        log.info("Offre d'embauche créée pour candidature #{}", applicationId);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public JobOfferEmbaucheDto findByApplicationId(Long applicationId) {
        JobOfferEmbauche offer = offerEmbaucheRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune offre d'embauche pour la candidature : " + applicationId));
        return toDto(offer);
    }

    @Transactional(readOnly = true)
    public byte[] getPdf(Long offerId) throws IOException {
        JobOfferEmbauche offer = offerEmbaucheRepository.findById(offerId)
                .orElseThrow(() -> new ResourceNotFoundException("Offre introuvable : " + offerId));
        if (offer.getPdfPath() != null && Files.exists(Paths.get(offer.getPdfPath()))) {
            return Files.readAllBytes(Paths.get(offer.getPdfPath()));
        }
        return generatePdfBytes(offer);
    }

    public JobOfferEmbaucheDto acceptOffer(Long applicationId) {
        JobOfferEmbauche offer = getOfferForApplication(applicationId);
        offer.setStatus(JobOfferEmbauche.Status.ACCEPTED);
        log.info("Offre d'embauche #{} acceptée par le candidat", offer.getId());
        return toDto(offerEmbaucheRepository.save(offer));
    }

    public JobOfferEmbaucheDto rejectOffer(Long applicationId) {
        JobOfferEmbauche offer = getOfferForApplication(applicationId);
        offer.setStatus(JobOfferEmbauche.Status.REJECTED);
        log.info("Offre d'embauche #{} refusée par le candidat", offer.getId());
        return toDto(offerEmbaucheRepository.save(offer));
    }

    private JobOfferEmbauche getOfferForApplication(Long applicationId) {
        return offerEmbaucheRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune offre pour la candidature : " + applicationId));
    }

    private byte[] generatePdfBytes(JobOfferEmbauche offer) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 72, 72, 72, 72);
        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(31, 56, 100));
        Font h2Font = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(91, 155, 213));
        Font bodyFont = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.BLACK);
        Font boldFont = new Font(Font.HELVETICA, 11, Font.BOLD, Color.BLACK);

        document.add(new Paragraph("\n"));
        Paragraph title = new Paragraph("ITEAM University", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("RecruitTracker — Offre d'Embauche", h2Font);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);
        document.add(new Paragraph("\n"));

        Application app = offer.getApplication();
        String candidateName = app.getCandidate().getName();
        String candidateEmail = app.getCandidate().getEmail();

        document.add(new Paragraph("Candidat : " + candidateName, boldFont));
        document.add(new Paragraph("Email : " + candidateEmail, bodyFont));
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Poste proposé : " + offer.getPosition(), boldFont));
        if (offer.getSalary() != null) {
            document.add(new Paragraph("Salaire : " + String.format("%.0f TND/mois", offer.getSalary()), bodyFont));
        }
        if (offer.getStartDate() != null) {
            document.add(new Paragraph("Date de début : " + offer.getStartDate(), bodyFont));
        }
        if (offer.getBenefits() != null && !offer.getBenefits().isBlank()) {
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Avantages :", boldFont));
            document.add(new Paragraph(offer.getBenefits(), bodyFont));
        }
        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("Fait à Tunis, le " + java.time.LocalDate.now(), bodyFont));
        document.add(new Paragraph("\n\n"));
        document.add(new Paragraph("Signature du recruteur : ___________________", bodyFont));

        document.close();
        return baos.toByteArray();
    }

    private JobOfferEmbaucheDto toDto(JobOfferEmbauche offer) {
        JobOfferEmbaucheDto dto = new JobOfferEmbaucheDto();
        dto.setId(offer.getId());
        dto.setApplicationId(offer.getApplication().getId());
        dto.setCandidateName(offer.getApplication().getCandidate().getName());
        dto.setCandidateEmail(offer.getApplication().getCandidate().getEmail());
        dto.setPosition(offer.getPosition());
        dto.setSalary(offer.getSalary());
        dto.setStartDate(offer.getStartDate());
        dto.setBenefits(offer.getBenefits());
        dto.setGeneratedAt(offer.getGeneratedAt());
        dto.setStatus(offer.getStatus());
        dto.setHasPdf(offer.getPdfPath() != null);
        return dto;
    }
}
