package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "SelectionProcessTypeRead", description = "Standard representation of a selection process type.")
public record SelectionProcessTypeReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this selection process type.")
    Long id,

    @Schema(description = "The code of this selection process type.", example = "COMPETITIVE")
    String code,

    @Schema(description = "The English name of this selection process type.", example = "Competitive Selection")
    String nameEn,

    @Schema(description = "The French name of this selection process type.", example = "Sélection concurrentielle")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this selection process type.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this selection process type was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this selection process type.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this selection process type was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
