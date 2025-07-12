package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "ProfileStatusRead", description = "Standard representation of a profile status.")
public record ProfileStatusReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this profile status.")
    Long id,

    @Schema(description = "The code of this profile status.", example = "ACTIVE")
    String code,

    @Schema(description = "The English name of this profile status.", example = "Active")
    String nameEn,

    @Schema(description = "The French name of this profile status.", example = "Actif")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this profile status.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this profile status was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this profile status.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this profile status was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
