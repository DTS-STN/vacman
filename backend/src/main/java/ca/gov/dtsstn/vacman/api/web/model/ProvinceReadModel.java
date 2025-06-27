package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "ProvinceRead", description = "Standard representation of a province.")
public record ProvinceReadModel(
        @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this province.")
        Long id,

        @Schema(description = "The code of this province.", example = "YT")
        String code,

        @Schema(description = "The English name of this province.", example = "Yukon")
        String nameEn,

        @Schema(description = "The French name of this province.", example = "Yukon")
        String nameFr,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this province.", example = "vacman-api")
        String createdBy,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this province was created.", example = "2000-01-01T00:00:00Z")
        Instant createdDate,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this province.", example = "vacman-api")
        String lastModifiedBy,

        @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this province was last modified.", example = "2000-01-01T00:00:00Z")
        Instant lastModifiedDate
) {}