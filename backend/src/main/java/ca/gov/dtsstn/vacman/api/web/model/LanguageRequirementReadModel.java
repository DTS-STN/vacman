package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "LanguageRequirementRead", description = "Standard representation of a language requirement.")
public record LanguageRequirementReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this language requirement.")
    Long id,

    @Schema(description = "The code of this language requirement.", example = "BILINGUAL")
    String code,

    @Schema(description = "The English name of this language requirement.", example = "Bilingual - Imperative")
    String nameEn,

    @Schema(description = "The French name of this language requirement.", example = "Bilingue - Impératif")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this language requirement.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this language requirement was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this language requirement.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this language requirement was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
