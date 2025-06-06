package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "WfaStatusRead", description = "Standard representation of a WFA status.")
public record WfaStatusReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this WFA status.")
    Long id,

    @Schema(description = "The code of this WFA status.", example = "AFFECTED")
    String code,

    @Schema(description = "The English name of this WFA status.", example = "Affected")
    String nameEn,

    @Schema(description = "The French name of this WFA status.", example = "Affected but in French")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this WFA status.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this WFA status was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this WFA status.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this WFA status was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}