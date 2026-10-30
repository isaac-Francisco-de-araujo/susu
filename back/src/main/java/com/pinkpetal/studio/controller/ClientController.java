package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.service.ClientService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
public class ClientController {
    private final ClientService service;
    public ClientController(ClientService service) { this.service = service; }
    @GetMapping public List<ClientResponse> list() { return service.list(); }
    @GetMapping("/{id}/history") public List<StudioAppointment> history(@PathVariable UUID id) { return service.history(id); }
    @PostMapping public ResponseEntity<ClientResponse> create(@Valid @RequestBody ClientInput input) {
        var result = service.save(null, input);
        return ResponseEntity.created(URI.create("/api/clients/" + result.id())).body(result);
    }
    @PutMapping("/{id}") public ClientResponse update(@PathVariable UUID id, @Valid @RequestBody ClientInput input) { return service.save(id, input); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
