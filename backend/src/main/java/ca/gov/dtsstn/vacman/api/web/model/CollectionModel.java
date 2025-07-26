package ca.gov.dtsstn.vacman.api.web.model;

import java.util.List;

public record CollectionModel<T>(
	List<T> content
) {}
