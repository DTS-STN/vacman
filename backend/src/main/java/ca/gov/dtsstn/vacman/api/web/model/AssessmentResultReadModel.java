package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "AssessmentResultRead", description = "Standard representation of an assessment result.")
public record AssessmentResultReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this assessment result.")
    Long id,

    @Schema(description = "The code of this assessment result.", example = "SUITABLE")
    String code,

    @Schema(description = "The English name of this assessment result.", example = "Suitable")
    String nameEn,

    @Schema(description = "The French name of this assessment result.", example = "Convenable")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this assessment result.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this assessment result was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this assessment result.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this assessment result was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
