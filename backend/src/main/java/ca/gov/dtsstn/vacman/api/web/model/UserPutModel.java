package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UserPutUpdate")
public record UserPutModel(
	@NotNull(message = "firstName must not be null")
	@Schema(description = "The first name of this user.", example = "John", requiredMode = RequiredMode.REQUIRED)
	String firstName,

	@Schema(description = "The middle name of this user.", example = "A", requiredMode = RequiredMode.NOT_REQUIRED)
	String middleName,

	@NotNull(message = "lastName must not be null")
	@Schema(description = "The last name of this user.", example = "Doe", requiredMode = RequiredMode.REQUIRED)
	String lastName,

	@Schema(description = "The initials of this user.", example = "JAD", requiredMode = RequiredMode.NOT_REQUIRED)
	String initials,

	@NotNull(message = "personalRecordIdentifier must not be null")
	@Schema(description = "The personal record identifier of this user.", example = "12345", requiredMode = RequiredMode.REQUIRED)
	String personalRecordIdentifier,

	@NotNull(message = "businessPhone must not be null")
	@Schema(description = "The business phone of this user.", example = "555-123-4567", requiredMode = RequiredMode.REQUIRED)
	String businessPhone,

	@NotNull(message = "businessEmail must not be null")
	@Schema(description = "The business email of this user.", example = "john.doe@example.com", requiredMode = RequiredMode.REQUIRED)
	String businessEmail,

	@NotNull(message = "languageId must not be null")
	@ValidLanguageCode(message = "Language not found")
	@Schema(description = "The language ID for this user.", example = "1", requiredMode = RequiredMode.REQUIRED)
	Long languageId
) {}
