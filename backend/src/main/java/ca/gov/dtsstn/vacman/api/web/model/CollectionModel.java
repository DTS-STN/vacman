package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "A collection of items.")
public record CollectionModel<T>(
	@Schema(description = "The data contained in this collection.")
	Iterable<T> content
) {}