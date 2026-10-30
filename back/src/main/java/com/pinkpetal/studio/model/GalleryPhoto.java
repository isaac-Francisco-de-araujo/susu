package com.pinkpetal.studio.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "gallery_photos")
public class GalleryPhoto {
    @Id @GeneratedValue(strategy = GenerationType.UUID) public UUID id;
    @Column(nullable = false, length = 150) public String title;
    @Column(nullable = false, length = 2048) public String image;
    @Column(nullable = false) public boolean active;
    @Column(nullable = false) public int displayOrder;
}
