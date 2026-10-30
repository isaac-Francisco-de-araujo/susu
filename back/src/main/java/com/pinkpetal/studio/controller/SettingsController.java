package com.pinkpetal.studio.controller;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final SettingsService service;
    public SettingsController(SettingsService service) { this.service = service; }
    @GetMapping public Object get(java.security.Principal principal) {
        var settings = service.get();
        return com.pinkpetal.studio.security.AdminAccess.allowed(principal)
                ? settings : PublicSettingsResponse.from(settings);
    }
    @PutMapping public StudioSettings save(@Valid @RequestBody SettingsInput input) { return service.save(input); }
}
