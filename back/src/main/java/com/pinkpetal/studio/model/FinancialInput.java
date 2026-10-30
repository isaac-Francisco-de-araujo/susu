package com.pinkpetal.studio.model;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FinancialInput(
        @NotNull @Pattern(regexp = "Entrada|Despesa") String type,
        @NotBlank @Size(max = 500) String description,
        @NotNull LocalDate date,
        @NotNull @Pattern(regexp = "Pix|Dinheiro|Débito|Crédito") String payment,
        @NotNull @DecimalMin("0.01") @Digits(integer = 10, fraction = 2) BigDecimal amount
) {}
