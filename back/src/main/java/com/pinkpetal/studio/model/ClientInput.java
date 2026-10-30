package com.pinkpetal.studio.model;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ClientInput(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Pattern(regexp = "[+0-9 ()-]{10,25}") String phone,
        @PastOrPresent LocalDate birthday, @PastOrPresent LocalDate firstVisit,
        @NotNull @Size(max = 5000) String notes
) {
    @AssertTrue(message = "Informe o telefone com DDI e DDD, entre 10 e 15 dígitos")
    public boolean isValidPhone() {
        if (phone == null) return true;
        int length = phone.replaceAll("\\D", "").length();
        return length >= 10 && length <= 15;
    }
}
