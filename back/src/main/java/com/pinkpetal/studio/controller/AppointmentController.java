package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.service.AppointmentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;
    public AppointmentController(AppointmentService service) { this.service = service; }
    @GetMapping public List<StudioAppointment> list() { return service.list(); }
    @PostMapping public ResponseEntity<StudioAppointment> create(@Valid @RequestBody AppointmentInput input) {
        var result = service.save(null, input);
        return ResponseEntity.created(URI.create("/api/appointments/" + result.id)).body(result);
    }
    @PutMapping("/{id}") public StudioAppointment update(@PathVariable UUID id, @Valid @RequestBody AppointmentInput input) { return service.save(id, input); }
}
