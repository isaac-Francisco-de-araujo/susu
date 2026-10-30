package com.pinkpetal.studio.service;

import com.pinkpetal.studio.model.*;
import com.pinkpetal.studio.repository.SettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SettingsService {
    private final SettingsRepository repository;
    public SettingsService(SettingsRepository repository) { this.repository = repository; }
    public StudioSettings get() { return repository.findById(1).orElseThrow(); }

    @Transactional
    public StudioSettings save(SettingsInput input) {
        var settings = get();
        settings.studioName = input.studioName().trim();
        settings.professionalName = input.professionalName().trim();
        settings.whatsapp = input.whatsapp().replaceAll("\\D", "");
        settings.instagram = input.instagram().replaceFirst("^@", "");
        settings.address = input.address();
        settings.firstWeekday = input.firstWeekday();
        settings.slotMinutes = input.slotMinutes();
        settings.opensAt = input.opensAt();
        settings.closesAt = input.closesAt();
        settings.remindersEnabled = input.remindersEnabled();
        return settings;
    }
}
