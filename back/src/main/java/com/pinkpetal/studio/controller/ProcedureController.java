package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.model.ProcedureInput;
import com.pinkpetal.studio.model.ProcedureResponse;
import com.pinkpetal.studio.service.ProcedureService;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
public class ProcedureController {
    private final ProcedureService service;

    public ProcedureController(ProcedureService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProcedureResponse> list(@RequestParam(defaultValue = "false") boolean activeOnly, Principal principal) {
        return service.list(activeOnly || !com.pinkpetal.studio.security.AdminAccess.allowed(principal));
    }

    @GetMapping("/{id}")
    public ProcedureResponse get(@PathVariable UUID id, Principal principal) {
        var item = service.get(id);
        if (!com.pinkpetal.studio.security.AdminAccess.allowed(principal) && !item.active()) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        return item;
    }

    @PostMapping
    public ResponseEntity<ProcedureResponse> create(@Valid @RequestBody ProcedureInput input) {
        var created = service.create(input);
        return ResponseEntity.created(URI.create("/api/services/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public ProcedureResponse update(@PathVariable UUID id, @Valid @RequestBody ProcedureInput input) {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
