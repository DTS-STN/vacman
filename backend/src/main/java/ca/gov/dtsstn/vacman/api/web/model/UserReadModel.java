package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "UserRead", description = "Standard representation of a user.")
public record UserReadModel(
	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this user.", example = "00000000-0000-0000-0000-000000000000")
	Long id,

	@Schema(description = "The full name of this user.", example = "John Doe")
	String name,

	@Schema(description = "The Active Directory ID of this user.", example = "user@example.com")
	String activeDirectoryId,

	@Schema(description = "The role of this user.", example = "employee")
	String role,

	@Schema(description = "Whether the user has accepted the privacy consent.", example = "true")
	Boolean privacyConsentAccepted,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this user.", example = "vacman-api")
	String createdBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was created.", example = "2000-01-01T00:00:00Z")
	Instant createdDate,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this user.", example = "vacman-api")
	String lastModifiedBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was last modified.", example = "2000-01-01T00:00:00Z")
	Instant lastModifiedDate
) {}
