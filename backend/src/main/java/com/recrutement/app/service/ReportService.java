package com.recrutement.app.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import com.recrutement.app.entity.Application;
import com.recrutement.app.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReportService {

    private final ApplicationRepository applicationRepository;

    public String exportCsv() throws IOException {
        List<Application> apps = applicationRepository.findAll();
        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            writer.writeNext(new String[]{"ID", "Candidat", "Email", "Poste", "Statut", "Date candidature"});
            for (Application app : apps) {
                writer.writeNext(new String[]{
                        String.valueOf(app.getId()),
                        app.getCandidate().getName(),
                        app.getCandidate().getEmail(),
                        app.getJobOffer().getTitle(),
                        app.getStatus().name(),
                        app.getAppliedDate() != null ? app.getAppliedDate().toString() : ""
                });
            }
        }
        log.info("Export CSV généré : {} candidatures", apps.size());
        return sw.toString();
    }

    public byte[] exportPdf() throws IOException {
        List<Application> apps = applicationRepository.findAll();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 36, 36, 54, 36);
        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD, new Color(31, 56, 100));
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
        Font bodyFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);

        Paragraph title = new Paragraph("RecruitTracker — Rapport de Recrutement", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("Généré le : " + java.time.LocalDate.now(),
                new Font(Font.HELVETICA, 9, Font.ITALIC)));
        document.add(new Paragraph("\n"));

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1f, 2.5f, 2.5f, 2.5f, 1.5f, 2f});

        String[] headers = {"ID", "Candidat", "Email", "Poste", "Statut", "Date"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new Color(31, 56, 100));
            cell.setPadding(5);
            table.addCell(cell);
        }

        Color altRow = new Color(235, 241, 250);
        int rowNum = 0;
        for (Application app : apps) {
            Color bg = rowNum++ % 2 == 0 ? Color.WHITE : altRow;
            addCell(table, String.valueOf(app.getId()), bodyFont, bg);
            addCell(table, app.getCandidate().getName(), bodyFont, bg);
            addCell(table, app.getCandidate().getEmail(), bodyFont, bg);
            addCell(table, app.getJobOffer().getTitle(), bodyFont, bg);
            addCell(table, app.getStatus().name(), bodyFont, bg);
            addCell(table, app.getAppliedDate() != null ? app.getAppliedDate().toLocalDate().toString() : "", bodyFont, bg);
        }

        document.add(table);
        document.close();

        log.info("Export PDF généré : {} candidatures", apps.size());
        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(4);
        table.addCell(cell);
    }
}
