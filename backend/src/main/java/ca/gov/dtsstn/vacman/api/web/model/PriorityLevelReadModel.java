package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "PriorityLevelRead", description = "Standard representation of a priority level.")
public record PriorityLevelReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this priority level.")
    Long id,

    @Schema(description = "The code of this priority level.", example = "HIGH")
    String code,

    @Schema(description = "The English name of this priority level.", example = "High Priority")
    String nameEn,

    @Schema(description = "The French name of this priority level.", example = "Priorité élevée")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this priority level.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this priority level was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this priority level.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this priority level was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
