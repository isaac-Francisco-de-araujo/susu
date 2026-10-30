package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.service.GalleryService;
import jakarta.validation.Valid;
import java.net.URI;
import java.security.Principal;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {
    private final GalleryService service;
    public GalleryController(GalleryService service) { this.service = service; }
    @GetMapping public List<GalleryPhoto> list(Principal principal) {
        return service.list().stream().filter(item -> com.pinkpetal.studio.security.AdminAccess.allowed(principal) || item.active).toList();
    }
    @PostMapping public ResponseEntity<GalleryPhoto> create(@Valid @RequestBody GalleryInput input) {
        var result = service.save(null, input);
        return ResponseEntity.created(URI.create("/api/gallery/" + result.id)).body(result);
    }
    @PutMapping("/{id}") public GalleryPhoto update(@PathVariable UUID id, @Valid @RequestBody GalleryInput input) { return service.save(id, input); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
