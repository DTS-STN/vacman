package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UserCreate")
public record UserCreateModel(
	@Schema(description = "The Active Directory ID of this user.", example = "user@example.com")
	String activeDirectoryId,

	@NotNull(message = "Role is required.")
	@Schema(description = "The role of this user.", example = "employee")
	String role
) {}
