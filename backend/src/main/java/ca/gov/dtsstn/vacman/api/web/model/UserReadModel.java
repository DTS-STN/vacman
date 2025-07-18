package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "User", description = "Standard representation of a user.")
public record UserReadModel(
	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this user.", example = "1")
	Long id,

	@Schema(description = "The role of this user.", example = "employee")
	String role,

	@Schema(description = "The network name of this user.", example = "user@example.com")
	String networkName,

	@Schema(description = "The UU name of this user.", example = "user123")
	String uuName,

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

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this user.", example = "vacman-api")
	String userCreated,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was created.", example = "2000-01-01T00:00:00Z")
	String dateCreated,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this user.", example = "vacman-api")
	String userUpdated,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was last modified.", example = "2000-01-01T00:00:00Z")
	String dateUpdated
) {}
