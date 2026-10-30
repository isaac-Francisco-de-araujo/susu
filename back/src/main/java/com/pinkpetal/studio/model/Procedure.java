package com.pinkpetal.studio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "services")
public class Procedure {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(name = "short", nullable = false)
    private String shortDescription;
    @Column(nullable = false, length = 5000)
    private String description;
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    @Column(nullable = false, length = 50)
    private String duration;
    @Column(nullable = false, length = 100)
    private String icon;
    @Column(nullable = false, length = 2048)
    private String image;
    @Column(nullable = false)
    private boolean active;

    protected Procedure() {}

    public Procedure(ProcedureInput input) {
        update(input);
    }

    public void update(ProcedureInput input) {
        name = input.name().trim();
        shortDescription = input.shortDescription();
        description = input.description();
        price = input.price();
        duration = input.duration().trim();
        icon = input.icon();
        image = input.image();
        active = input.active();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getShortDescription() { return shortDescription; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public String getDuration() { return duration; }
    public String getIcon() { return icon; }
    public String getImage() { return image; }
    public boolean isActive() { return active; }
}
