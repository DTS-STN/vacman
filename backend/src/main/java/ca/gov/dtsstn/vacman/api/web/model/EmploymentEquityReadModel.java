package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "EmploymentEquityRead", description = "Standard representation of an employment equity.")
public record EmploymentEquityReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this employment equity.")
    Long id,

    @Schema(description = "The code of this employment equity.", example = "WOMEN")
    String code,

    @Schema(description = "The English name of this employment equity.", example = "Women")
    String nameEn,

    @Schema(description = "The French name of this employment equity.", example = "Femmes")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this employment equity.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this employment equity was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this employment equity.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this employment equity was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
