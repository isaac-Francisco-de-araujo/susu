package com.pinkpetal.studio.model;

import java.time.LocalTime;

/** Explicit public contract: internal scheduling preferences never leave the admin area. */
public record PublicSettingsResponse(String studioName, String professionalName, String whatsapp,
                                     String instagram, String address, LocalTime opensAt, LocalTime closesAt) {
    public static PublicSettingsResponse from(StudioSettings settings) {
        return new PublicSettingsResponse(settings.studioName, settings.professionalName,
                settings.whatsapp, settings.instagram, settings.address, settings.opensAt, settings.closesAt);
    }
}
