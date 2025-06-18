package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "LanguageReferralTypeRead", description = "Standard representation of a language referral type.")
public record LanguageReferralTypeReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this language referral type.")
    Long id,

    @Schema(description = "The code of this language referral type.", example = "EN")
    String code,

    @Schema(description = "The English name of this language referral type.", example = "Bilingual")
    String nameEn,

    @Schema(description = "The French name of this language referral type.", example = "Bilingue")
    String nameFr,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this language referral type.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this language referral type was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this language referral type.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this language referral type was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}