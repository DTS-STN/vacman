package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@RecordBuilder
@Schema(name = "UserCreate")
public record UserCreateModel(
	@NotNull(message = "Language ID is required.")
	@ValidLanguageCode(message = "Language not found")
	@Schema(description = "The language ID for this user.", example = "00000000-0000-0000-0000-000000000000")
	Long languageId
) {}
