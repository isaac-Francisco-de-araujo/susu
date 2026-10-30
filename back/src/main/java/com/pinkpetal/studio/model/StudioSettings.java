package com.pinkpetal.studio.model;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "studio_settings")
public class StudioSettings {
    @Id public Integer id;
    @Column(nullable = false, length = 150) public String studioName;
    @Column(nullable = false, length = 150) public String professionalName;
    @Column(nullable = false, length = 25) public String whatsapp;
    @Column(nullable = false, length = 100) public String instagram;
    @Column(nullable = false, length = 1000) public String address;
    @Column(nullable = false) public int firstWeekday;
    @Column(nullable = false) public int slotMinutes;
    @Column(nullable = false) public LocalTime opensAt;
    @Column(nullable = false) public LocalTime closesAt;
    @Column(nullable = false) public boolean remindersEnabled;
}
