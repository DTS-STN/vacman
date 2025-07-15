package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UserCreate")
public record UserCreateModel(
	@Schema(description = "The Active Directory ID of this user.", example = "12345678-1234-1234-1234-123456789abc")
	String activeDirectoryId,

	@NotNull(message = "Role is required.")
	@Schema(description = "The role of this user.", example = "admin")
	String role,

	@NotNull(message = "Language code is required.")
	@Schema(description = "The language code for this user.", example = "FR")
	String languageCode
) {}
