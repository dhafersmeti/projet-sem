package com.recrutement.app.controller;

import com.recrutement.app.dto.InterviewDto;
import com.recrutement.app.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<List<InterviewDto>> findAll() {
        return ResponseEntity.ok(interviewService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewDto> findById(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.findById(id));
    }

    @PostMapping
    public ResponseEntity<InterviewDto> create(@Valid @RequestBody InterviewDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(interviewService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterviewDto> update(@PathVariable Long id,
                                                @Valid @RequestBody InterviewDto dto) {
        return ResponseEntity.ok(interviewService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        interviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
