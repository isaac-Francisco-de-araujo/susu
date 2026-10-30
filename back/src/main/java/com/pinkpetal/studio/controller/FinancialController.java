package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.service.FinancialService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/finance")
public class FinancialController {
    private final FinancialService service;
    public FinancialController(FinancialService service) { this.service = service; }
    @GetMapping public List<FinancialResponse> list() { return service.list(); }
    @PostMapping public ResponseEntity<FinancialResponse> create(@Valid @RequestBody FinancialInput input) {
        var saved = service.save(null, input);
        return ResponseEntity.created(URI.create("/api/finance/" + saved.id())).body(saved);
    }
    @PutMapping("/{id}") public FinancialResponse update(@PathVariable UUID id, @Valid @RequestBody FinancialInput input) { return service.save(id, input); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
