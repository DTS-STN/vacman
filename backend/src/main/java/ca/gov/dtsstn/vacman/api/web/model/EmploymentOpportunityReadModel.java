package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "EmploymentOpportunityRead", description = "Standard representation of an employment opportunity.")
public record EmploymentOpportunityReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this employment opportunity.")
    Long id,

    @Schema(description = "The code of this employment opportunity.", example = "CASUAL")
    String code,

    @Schema(description = "The English name of this employment opportunity.", example = "Casual Employment")
    String nameEn,

    @Schema(description = "The French name of this employment opportunity.", example = "Emploi occasionnel")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this employment opportunity.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this employment opportunity was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this employment opportunity.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this employment opportunity was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
