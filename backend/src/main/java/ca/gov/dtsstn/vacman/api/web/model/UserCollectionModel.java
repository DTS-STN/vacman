package ca.gov.dtsstn.vacman.api.web.model;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UserCollection", description = "A collection of users.")
public record UserCollectionModel(
		@Schema(description = "The collection of users.")
		List<UserReadModel> entries,

		@Schema(description = "The current page number (0-based).")
		int page,

		@Schema(description = "The size of the page.")
		int size,

		@Schema(description = "The total number of elements.")
		long totalElements,

		@Schema(description = "The total number of pages.")
		int totalPages
) {}
