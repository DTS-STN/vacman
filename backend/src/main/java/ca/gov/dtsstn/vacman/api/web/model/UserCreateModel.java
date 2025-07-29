package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.UniqueActiveDirectoryId;
import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidUserTypeCode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UserCreate")
public record UserCreateModel(
	@NotNull(message = "Active Directory ID is required.")
	@UniqueActiveDirectoryId(message = "User with this Active Directory ID already exists")
	@Schema(description = "The Active Directory ID of this user.", example = "12345678-1234-1234-1234-123456789abc")
	String activeDirectoryId,

	@NotNull(message = "Role is required.")
	@ValidUserTypeCode(message = "User type not found for role")
	@Schema(description = "The role of this user.", example = "admin")
	String role,

	@NotNull(message = "Language code is required.")
	@ValidLanguageCode(message = "Language not found with code")
	@Schema(description = "The language code for this user.", example = "FR")
	String languageCode
) {}
