package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "ClassificationRead", description = "Standard representation of a classification (employee's group and level).")
public record ClassificationReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this classification.")
    Long id,

    @Schema(description = "The code of this classification.", example = "IT3")
    String code,

    @Schema(description = "The English name of this classification.", example = "IT-03")
    String nameEn,

    @Schema(description = "The French name of this classification.", example = "IT-03")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this classification.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this classification was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this classification.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this classification was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}