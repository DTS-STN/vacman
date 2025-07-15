package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "ProfileCreateByActiveDirectoryId", description = "Model for creating a profile using Active Directory ID")
public record ProfileCreateByActiveDirectoryIdModel(
	@NotBlank(message = "Active Directory ID is required.")
	@Schema(description = "Active Directory ID (network name) of the user to create a profile for.",
			example = "2ca209f5-7913-491e-af5a-1f488ce0613b")
	String activeDirectoryId
) {}
