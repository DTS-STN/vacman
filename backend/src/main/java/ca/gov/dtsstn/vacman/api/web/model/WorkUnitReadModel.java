package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "WorkUnitRead", description = "Standard representation of a work unit.")
public record WorkUnitReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this work unit.")
    Long id,

    @Schema(description = "The code of this work unit.", example = "WU01")
    String code,

    @Schema(description = "The English name of this work unit.", example = "Service Canada Centre")
    String nameEn,

    @Schema(description = "The French name of this work unit.", example = "Centre Service Canada")
    String nameFr,
    
    @Schema(description = "The parent work unit of this work unit.")
    WorkUnitReadModel parent,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this work unit.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this work unit was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this work unit.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this work unit was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}