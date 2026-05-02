package com.recrutement.app.controller;

import com.recrutement.app.dto.EvaluationDto;
import com.recrutement.app.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<EvaluationDto> create(@Valid @RequestBody EvaluationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.create(dto));
    }

    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<EvaluationDto> findByInterviewId(@PathVariable Long interviewId) {
        return ResponseEntity.ok(evaluationService.findByInterviewId(interviewId));
    }
}
