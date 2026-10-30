package com.pinkpetal.studio.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.UUID;

public record ProcedureResponse(
        UUID id, String name, @JsonProperty("short") String shortDescription,
        String description, BigDecimal price, String duration, String icon,
        String image, boolean active
) {
    public static ProcedureResponse from(Procedure procedure) {
        return new ProcedureResponse(procedure.getId(), procedure.getName(),
                procedure.getShortDescription(), procedure.getDescription(),
                procedure.getPrice(), procedure.getDuration(), procedure.getIcon(),
                procedure.getImage(), procedure.isActive());
    }
}
