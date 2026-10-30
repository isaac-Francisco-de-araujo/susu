package com.pinkpetal.studio.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "financial_entries")
public class FinancialEntry {
    @Id @GeneratedValue(strategy = GenerationType.UUID) public UUID id;
    @Column(nullable = false, length = 10) public String type;
    @Column(nullable = false, length = 500) public String description;
    @Column(name = "entry_date", nullable = false) public LocalDate date;
    @Column(nullable = false, length = 30) public String payment;
    @Column(nullable = false, precision = 12, scale = 2) public BigDecimal amount;
}
