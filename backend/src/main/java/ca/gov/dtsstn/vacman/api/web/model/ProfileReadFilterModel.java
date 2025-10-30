package ca.gov.dtsstn.vacman.api.web.model;

import java.util.Collection;
import java.util.Objects;
import java.util.Set;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;

@RecordBuilder
public record ProfileReadFilterModel(
	// Note: this field is intentionally /singular/ so that it will map
	// to the correct endpoint querystring param (ie: ?hrAdvisorId=1&hrAdvisorId=2)
	@Schema(description = "Filter by HR advisor IDs")
	Collection<String> hrAdvisorId,

	// Note: this field is intentionally /singular/ so that it will map
	// to the correct endpoint querystring param (ie: ?statusId=1&statusId=2)
	@Schema(description = "Filter by status IDs")
	Collection<String> statusId,

	@Schema(description = "Filter by employee first name")
	String firstName,

	@Schema(description = "Filter by employee middle name")
	String middleName,

	@Schema(description = "Filter by employee last name")
	String lastName
) {

	/**
	 * Constructor to prevent null collections being returned
	 */
	public ProfileReadFilterModel(Collection<String> hrAdvisorId, Collection<String> statusId, String firstName, String middleName, String lastName) {
		this.hrAdvisorId = Objects.requireNonNullElse(hrAdvisorId, Set.of());
		this.statusId = Objects.requireNonNullElse(statusId, Set.of());
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
	}
}
