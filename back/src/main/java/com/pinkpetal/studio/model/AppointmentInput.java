package com.pinkpetal.studio.model;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentInput(
        @NotNull UUID clientId, @NotNull UUID serviceId, @NotNull LocalDateTime startsAt,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal price,
        @NotNull @Pattern(regexp = "Pendente|Confirmado|Atendido|Não atendido|Cancelado") String status,
        @NotNull @Pattern(regexp = "Pix|Dinheiro|Débito|Crédito") String payment,
        @NotNull @Size(max = 5000) String notes
) {}
