package ca.gov.dtsstn.vacman.api.web.model;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;

@RecordBuilder
public record RequestReadFilterModel(
	// Note: this field is intentionally /singular/ so that it will map
	// to the correct endpoint querystring param (ie: ?hrAdvisorId=1&hrAdvisorId=2)
	@Schema(description = "Filter by HR advisor IDs")
	Collection<String> hrAdvisorId,

	// Note: this field is intentionally /singular/ so that it will map
	// to the correct endpoint querystring param (ie: ?statusId=1&statusId=2)
	@Schema(description = "Filter by request status IDs")
	Collection<String> statusId,

	// Note: this field is intentionally /singular/ so that it will map
	// to the correct endpoint querystring param (ie: ?statusId=1&statusId=2)
	@Schema(description = "Filter by work unit IDs")
	Collection<String> workUnitId
) {

	/**
	 * Constructor to prevent null collections being returned
	 */
	public RequestReadFilterModel(Collection<String> hrAdvisorId, Collection<String> statusId, Collection<String> workUnitId) {
		this.hrAdvisorId = Objects.requireNonNullElse(hrAdvisorId, Set.of());
		this.statusId = Objects.requireNonNullElse(statusId, Set.of());
		this.workUnitId = Objects.requireNonNullElse(workUnitId, Set.of());
	}

}
