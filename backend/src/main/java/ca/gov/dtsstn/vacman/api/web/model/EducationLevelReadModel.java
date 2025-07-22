package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "EducationLevelRead", description = "Standard representation of an education level.")
public record EducationLevelReadModel(

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this education level.")
	Long id,

	@Schema(description = "The code of this education level.", example = "BD")
	String code,

	@Schema(description = "The English name of this education level.", example = "Bachelor's Degree")
	String nameEn,

	@Schema(description = "The French name of this education level.", example = "Baccalauréat")
	String nameFr,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this education level.", example = "vacman-api")
	String createdBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this education level was created.", example = "2000-01-01T00:00:00Z")
	Instant createdDate,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this education level.", example = "vacman-api")
	String lastModifiedBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this education level was last modified.", example = "2000-01-01T00:00:00Z")
	Instant lastModifiedDate

) {}