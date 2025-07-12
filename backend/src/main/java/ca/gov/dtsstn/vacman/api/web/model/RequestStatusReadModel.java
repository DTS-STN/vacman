package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "RequestStatusRead", description = "Standard representation of a request status.")
public record RequestStatusReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this request status.")
    Long id,

    @Schema(description = "The code of this request status.", example = "OPEN")
    String code,

    @Schema(description = "The English name of this request status.", example = "Open")
    String nameEn,

    @Schema(description = "The French name of this request status.", example = "Ouvert")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this request status.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this request status was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this request status.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this request status was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
