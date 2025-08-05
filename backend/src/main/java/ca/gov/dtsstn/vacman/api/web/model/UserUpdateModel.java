package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidUserTypeCode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UserUpdate")
public record UserUpdateModel(
	@NotNull(message = "User ID is required.")
	@Schema(description = "The unique identifier for this user.", example = "1")
	Long id,

	@ValidUserTypeCode(message = "User type not found")
	@Schema(description = "The user type of this user.", example = "00000000-0000-0000-0000-000000000000")
	Long userTypeId,

	@Schema(description = "The Microsoft Entra ID of this user.", example = "00000000-0000-0000-0000-000000000000")
	String microsoftEntraId,

	@Schema(description = "The first name of this user.", example = "John")
	String firstName,

	@Schema(description = "The middle name of this user.", example = "A")
	String middleName,

	@Schema(description = "The last name of this user.", example = "Doe")
	String lastName,

	@Schema(description = "The initials of this user.", example = "JAD")
	String initials,

	@Schema(description = "The personal record identifier of this user.", example = "12345")
	String personalRecordIdentifier,

	@Schema(description = "The business phone of this user.", example = "555-123-4567")
	String businessPhone,

	@Schema(description = "The business email of this user.", example = "john.doe@example.com")
	String businessEmail,

	@ValidLanguageCode(message = "Language not found")
	@Schema(description = "The language ID for this user.", example = "00000000-0000-0000-0000-000000000000")
	Long languageId
) {}
