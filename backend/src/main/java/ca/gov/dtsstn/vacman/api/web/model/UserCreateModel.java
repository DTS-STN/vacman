package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@RecordBuilder
@Schema(name = "UserCreate")
public record UserCreateModel(
	@NotNull(message = "Language code is required.")
	@ValidLanguageCode(message = "Language not found with code")
	@Schema(description = "The language code for this user.", example = "FR")
	String languageCode
) {}
