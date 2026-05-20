package com.recrutement.app.controller;

import com.recrutement.app.dto.JobOfferEmbaucheDto;
import com.recrutement.app.service.ApplicationService;
import com.recrutement.app.service.DashboardService;
import com.recrutement.app.service.OfferEmbaucheService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RecruiterController {

    private final DashboardService dashboardService;
    private final ApplicationService applicationService;
    private final OfferEmbaucheService offerEmbaucheService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           Authentication auth) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Le statut est obligatoire"));
        }
        return ResponseEntity.ok(applicationService.updateStatus(id, status, auth.getName()));
    }

    @PostMapping("/applications/{id}/offer")
    public ResponseEntity<?> createOffer(@PathVariable Long id,
                                          @Valid @RequestBody JobOfferEmbaucheDto dto) {
        return ResponseEntity.ok(offerEmbaucheService.create(id, dto));
    }

    @GetMapping("/offers/{id}/pdf")
    public ResponseEntity<byte[]> downloadOfferPdf(@PathVariable Long id) throws IOException {
        byte[] pdf = offerEmbaucheService.getPdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"offre_embauche_" + id + ".pdf\"")
                .body(pdf);
    }

    @GetMapping("/applications/by-position/{positionId}")
    public ResponseEntity<?> getApplicationsByPosition(@PathVariable Long positionId) {
        return ResponseEntity.ok(applicationService.findByJobOfferId(positionId));
    }
}
