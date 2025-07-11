package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "AppointmentNonAdvertisedRead", description = "Standard representation of an appointment non-advertised.")
public record AppointmentNonAdvertisedReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this appointment non-advertised.")
    Long id,

    @Schema(description = "The code of this appointment non-advertised.", example = "ACTING")
    String code,

    @Schema(description = "The English name of this appointment non-advertised.", example = "Acting appointment")
    String nameEn,

    @Schema(description = "The French name of this appointment non-advertised.", example = "Nomination par intérim")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this appointment non-advertised.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this appointment non-advertised was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this appointment non-advertised.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this appointment non-advertised was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
