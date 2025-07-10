package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

import java.time.Instant;

@Schema(name = "EmploymentTenureRead", description = "Standard representation of an employment tenure.")
public record EmploymentTenureReadModel(
        @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this employment tenure.")
        Long id,

        @Schema(description = "The code of this employment tenure.", example = "ASSIGNMENT")
        String code,

        @Schema(description = "The English name of this employment tenure.", example = "Assignment")
        String nameEn,

        @Schema(description = "The French name of this employment tenure.", example = "Affectation")
        String nameFr,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this employment tenure.", example = "vacman-api")
        String createdBy,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this employment tenure was created.", example = "2000-01-01T00:00:00Z")
        Instant createdDate,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this employment tenure.", example = "vacman-api")
        String lastModifiedBy,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this employment tenure was last modified.", example = "2000-01-01T00:00:00Z")
        Instant lastModifiedDate
) {}
