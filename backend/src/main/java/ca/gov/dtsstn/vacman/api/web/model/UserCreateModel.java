package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.RequiredMode;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "UserCreate")
public record UserCreateModel(
	@NotBlank(message = "name must not be blank")
	@Schema(example = "Firstname Lastname", description = "The name of this user.", requiredMode = RequiredMode.REQUIRED)
	String name
) {}
