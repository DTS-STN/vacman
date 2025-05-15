package ca.gov.dtsstn.vacman.api.web.model;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Users", description = "A list of users.")
public record UsersModel(
	@Schema(description = "The list of users.")
	List<UserModel> entries
) {}
