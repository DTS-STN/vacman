package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.UniqueMicrosoftEntraId;
import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidUserTypeCode;
import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@RecordBuilder
@Schema(name = "UserCreate")
public record UserCreateModel(
	@NotNull(message = "Language code is required.")
	@ValidLanguageCode(message = "Language not found with code")
	@Schema(description = "The language code for this user.", example = "FR")
	String languageCode,

	@NotNull(message = "Microsoft Entra ID is required.")
	@UniqueMicrosoftEntraId(message = "User with this Microsoft Entra ID already exists")
	@Schema(description = "The Microsoft Entra ID of this user.", example = "12345678-1234-1234-1234-123456789abc")
	String microsoftEntraId,

	@NotNull(message = "Role is required.")
	@ValidUserTypeCode(message = "User type not found for role")
	@Schema(description = "The role of this user.", example = "admin")
	String role
) {}
