package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "WorkScheduleRead", description = "Standard representation of a work schedule.")
public record WorkScheduleReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this work schedule.")
    Long id,

    @Schema(description = "The code of this work schedule.", example = "FT375")
    String code,

    @Schema(description = "The English name of this work schedule.", example = "Full-time - 37.5 hours per week")
    String nameEn,

    @Schema(description = "The French name of this work schedule.", example = "Temps plein - 37,5 heures par semaine")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this work schedule.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this work schedule was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this work schedule.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this work schedule was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
