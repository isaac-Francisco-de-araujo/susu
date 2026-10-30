package com.pinkpetal.studio.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialResponse(UUID id, String type, String description, LocalDate date,
                                String payment, BigDecimal amount, String source) {
    public static FinancialResponse from(FinancialEntry item) {
        return new FinancialResponse(item.id, item.type, item.description, item.date, item.payment, item.amount, "manual");
    }
}
