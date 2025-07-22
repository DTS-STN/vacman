package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "CityRead", description = "Standard representation of a city.")
public record CityReadModel(

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this city.")
	Long id,

	@Schema(description = "The code of this city.", example = "ON52")
	String code,

	@Schema(description = "The English name of this city.", example = "Ottawa")
	String nameEn,

	@Schema(description = "The province/territory this city belongs to.")
	ProvinceReadModel provinceTerritory,

	@Schema(description = "The code of the province this city belongs to.", example = "ON")
	String provinceCode,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this city.", example = "vacman-api")
	String createdBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this city was created.", example = "2000-01-01T00:00:00Z")
	Instant createdDate,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this city was last modified.", example = "2000-01-01T00:00:00Z")
	Instant lastModifiedDate
) {}
