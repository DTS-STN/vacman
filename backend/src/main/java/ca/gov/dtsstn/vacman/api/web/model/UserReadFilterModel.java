package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;

public record UserReadFilterModel(
	@Schema(description = "Filter by email address")
	String email,
	@Schema(description = "Filter by user type", allowableValues = { "hr-advisor" })
	String userType
) {}
