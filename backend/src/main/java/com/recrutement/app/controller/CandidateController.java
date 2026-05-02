package com.recrutement.app.controller;

import com.recrutement.app.dto.CandidateDto;
import com.recrutement.app.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    public ResponseEntity<List<CandidateDto>> findAll(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(candidateService.findAll(search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CandidateDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.findById(id));
    }

    @PostMapping
    public ResponseEntity<CandidateDto> create(@Valid @RequestBody CandidateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(candidateService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CandidateDto> update(@PathVariable Long id,
                                                @Valid @RequestBody CandidateDto dto) {
        return ResponseEntity.ok(candidateService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        candidateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cv")
    public ResponseEntity<Map<String, String>> uploadCv(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String fileName = candidateService.uploadCv(id, file);
        return ResponseEntity.ok(Map.of("fileName", fileName, "message", "CV uploadé avec succès"));
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) throws IOException {
        Path filePath = candidateService.getCvPath(id);
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filePath.getFileName() + "\"")
                .body(resource);
    }
}
