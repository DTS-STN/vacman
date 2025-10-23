package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidLanguageCode;
import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;

@RecordBuilder
@Schema(name = "UserPatchUpdate")
public record UserPatchModel(
	@Schema(description = "The first name of this user.", example = "John", requiredMode = RequiredMode.NOT_REQUIRED)
	String firstName,

	@Schema(description = "The middle name of this user.", example = "A", requiredMode = RequiredMode.NOT_REQUIRED)
	String middleName,

	@Schema(description = "The last name of this user.", example = "Doe", requiredMode = RequiredMode.NOT_REQUIRED)
	String lastName,

	@Schema(description = "The initials of this user.", example = "JAD", requiredMode = RequiredMode.NOT_REQUIRED)
	String initials,

	@Schema(description = "The personal record identifier of this user.", example = "12345", requiredMode = RequiredMode.NOT_REQUIRED)
	String personalRecordIdentifier,

	@Schema(description = "The business phone of this user.", example = "555-123-4567", requiredMode = RequiredMode.NOT_REQUIRED)
	String businessPhone,

	@Schema(description = "The business email of this user.", example = "john.doe@example.com", requiredMode = RequiredMode.NOT_REQUIRED)
	String businessEmail,

	@ValidLanguageCode(message = "Language not found")
	@Schema(description = "The language ID for this user.", example = "1", requiredMode = RequiredMode.NOT_REQUIRED)
	Long languageId
) {

	public static UserPatchModelBuilder builder() {
		return UserPatchModelBuilder.builder();
	}

}
