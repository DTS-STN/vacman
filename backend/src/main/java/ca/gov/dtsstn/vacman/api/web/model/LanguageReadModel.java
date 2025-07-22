package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "LanguageRead", description = "Standard representation of a language.")
public record LanguageReadModel(

		@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this language.")
		Long id,

		@Schema(description = "The code of this language.", example = "EN")
		String code,

		@Schema(description = "The English name of this language.", example = "English")
		String nameEn,

		@Schema(description = "The French name of this language.", example = "Anglais")
		String nameFr,

		@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this language.", example = "vacman-api")
		String createdBy,

		@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this language was created.", example = "2000-01-01T00:00:00Z")
		Instant createdDate,

		@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this language.", example = "vacman-api")
		String lastModifiedBy,

		@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this language was last modified.", example = "2000-01-01T00:00:00Z")
		Instant lastModifiedDate

) {}