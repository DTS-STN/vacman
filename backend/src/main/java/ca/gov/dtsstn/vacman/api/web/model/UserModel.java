package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "User", description = "Standard representation of a user.")
public record UserModel(
	@Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this user.", format = "uuid")
	String id,

	@Schema(description = "The name of this user.")
	String name,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this user.")
	String createdBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was created.")
	Instant createdDate,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this user.")
	String lastModifiedBy,

	@Schema(accessMode = AccessMode.READ_ONLY, description = "The time this user was last modified.")
	Instant lastModifiedDate
) {}