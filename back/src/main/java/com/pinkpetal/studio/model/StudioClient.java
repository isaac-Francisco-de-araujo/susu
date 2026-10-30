package com.pinkpetal.studio.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "clients")
public class StudioClient {
    @Id @GeneratedValue(strategy = GenerationType.UUID) public UUID id;
    @Column(nullable = false, length = 150) public String name;
    @Column(nullable = false, length = 25) public String phone;
    public LocalDate birthday;
    public LocalDate firstVisit;
    @Column(nullable = false, length = 5000) public String notes;
}
