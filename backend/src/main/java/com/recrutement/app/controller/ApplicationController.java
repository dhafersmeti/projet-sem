package com.recrutement.app.controller;

import com.recrutement.app.dto.ApplicationDto;
import com.recrutement.app.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<List<ApplicationDto>> findAll() {
        return ResponseEntity.ok(applicationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ApplicationDto> create(@Valid @RequestBody ApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.create(dto));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(applicationService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
