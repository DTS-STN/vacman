package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "User", description = "Standard representation of a user.")
public record UserReadModel(
	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this user.", example = "1")
	Long id,

	@Schema(description = "The type of this user.")
	UserTypeReadModel userType,

	@Schema(description = "The active directory ID of this user.", example = "user@example.com")
	String activeDirectoryId,

	@Schema(description = "The UUID of this user.", example = "user123")
	String uuid,

	@Schema(description = "The first name of this user.", example = "John")
	String firstName,

	@Schema(description = "The middle name of this user.", example = "A")
	String middleName,

	@Schema(description = "The last name of this user.", example = "Doe")
	String lastName,

	@Schema(description = "The initials of this user.", example = "JAD")
	String initial,

	@Schema(description = "The personal record identifier of this user.", example = "12345")
	String personalRecordIdentifier,

	@Schema(description = "The business phone of this user.", example = "555-123-4567")
	String businessPhoneNumber,

	@Schema(description = "The business email of this user.", example = "john.doe@example.com")
	String businessEmailAddress,

	@Schema(description = "The language associated with this user.")
	LanguageReadModel language,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this user.", example = "vacman-api")
	String createdBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was created.", example = "2000-01-01T00:00:00Z")
	Instant createdDate,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this user.", example = "vacman-api")
	String lastModifiedBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was last modified.", example = "2000-01-01T00:00:00Z")
	Instant lastModifiedDate
) {}
