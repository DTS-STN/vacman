package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(name = "UserCreate")
public record UserCreateModel(
	@NotNull(message = "Name is required.")
	@Schema(description = "The full name of this user.", example = "John Doe")
	@Size(min = 1, max = 256, message = "Name must be between 1 and 256 characters in length.")
	String name
) {}
