package com.recrutement.app.controller;

import com.recrutement.app.dto.JobOfferDto;
import com.recrutement.app.service.JobOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-offers")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService jobOfferService;

    @GetMapping
    public ResponseEntity<List<JobOfferDto>> findAll() {
        return ResponseEntity.ok(jobOfferService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobOfferDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(jobOfferService.findById(id));
    }

    @PostMapping
    public ResponseEntity<JobOfferDto> create(@Valid @RequestBody JobOfferDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(jobOfferService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobOfferDto> update(@PathVariable Long id,
                                               @Valid @RequestBody JobOfferDto dto) {
        return ResponseEntity.ok(jobOfferService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        jobOfferService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
