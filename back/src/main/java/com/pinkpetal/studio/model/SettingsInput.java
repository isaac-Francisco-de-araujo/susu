package com.pinkpetal.studio.model;

import jakarta.validation.constraints.*;
import java.time.LocalTime;

public record SettingsInput(
        @NotBlank @Size(max = 150) String studioName,
        @NotBlank @Size(max = 150) String professionalName,
        @NotBlank @Pattern(regexp = "[+0-9 ()-]{10,25}") String whatsapp,
        @NotNull @Pattern(regexp = "@?[a-zA-Z0-9._]{0,30}") String instagram,
        @NotNull @Size(max = 1000) String address,
        @NotNull @Min(0) @Max(1) Integer firstWeekday,
        @NotNull @Min(5) @Max(180) Integer slotMinutes,
        @NotNull LocalTime opensAt, @NotNull LocalTime closesAt,
        @NotNull Boolean remindersEnabled
) {
    @AssertTrue(message = "O término deve ser posterior ao início do atendimento")
    public boolean isValidHours() {
        return opensAt == null || closesAt == null || closesAt.isAfter(opensAt);
    }

    @AssertTrue(message = "Informe WhatsApp com DDI e DDD, entre 10 e 15 dígitos")
    public boolean isValidPhone() {
        if (whatsapp == null) return true;
        int length = whatsapp.replaceAll("\\D", "").length();
        return length >= 10 && length <= 15;
    }
}
