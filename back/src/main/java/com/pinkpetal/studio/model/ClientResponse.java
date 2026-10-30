package com.pinkpetal.studio.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ClientResponse(UUID id, String name, String phone, LocalDate birthday,
        LocalDate firstVisit, String notes, LocalDateTime lastVisit, String lastProcedure,
        int visits, BigDecimal spent) {}
