package com.pinkpetal.studio.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
public class StudioAppointment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) public UUID id;
    @Column(nullable = false) public UUID clientId;
    @Column(nullable = false) public UUID serviceId;
    @Column(nullable = false, length = 150) public String serviceName;
    @Column(nullable = false) public LocalDateTime startsAt;
    @Column(nullable = false) public int durationMinutes;
    @Column(nullable = false, precision = 12, scale = 2) public BigDecimal price;
    @Column(nullable = false, length = 30) public String status;
    @Column(nullable = false, length = 30) public String payment;
    @Column(nullable = false, length = 5000) public String notes;
}
