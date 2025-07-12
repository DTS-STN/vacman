package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "SecurityClearanceRead", description = "Standard representation of a security clearance.")
public record SecurityClearanceReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this security clearance.")
    Long id,

    @Schema(description = "The code of this security clearance.", example = "SECRET")
    String code,

    @Schema(description = "The English name of this security clearance.", example = "Secret")
    String nameEn,

    @Schema(description = "The French name of this security clearance.", example = "Secret")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this security clearance.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this security clearance was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this security clearance.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this security clearance was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
