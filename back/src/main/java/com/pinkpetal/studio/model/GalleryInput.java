package com.pinkpetal.studio.model;

import jakarta.validation.constraints.*;

public record GalleryInput(@NotBlank @Size(max = 150) String title,
        @NotBlank @Size(max = 2048) String image, @NotNull Boolean active,
        @NotNull @Min(0) @Max(100000) Integer displayOrder) {}
