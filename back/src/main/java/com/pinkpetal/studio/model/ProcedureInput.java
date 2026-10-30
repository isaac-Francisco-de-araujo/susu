package com.pinkpetal.studio.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProcedureInput(
        @NotBlank @Size(max = 150) String name,
        @JsonProperty("short") @NotNull @Size(max = 255) String shortDescription,
        @NotNull @Size(max = 5000) String description,
        @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal price,
        @NotBlank @Size(max = 50) String duration,
        @NotNull @Size(max = 100) String icon,
        @NotNull @Size(max = 2048) String image,
        @NotNull Boolean active
) {}
