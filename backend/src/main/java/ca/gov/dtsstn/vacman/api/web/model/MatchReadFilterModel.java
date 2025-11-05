package ca.gov.dtsstn.vacman.api.web.model;

import java.util.Set;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
public record MatchReadFilterModel(
	ProfileFilter profile,
	// Note: this field is intentionally /singular/ so that it will map
	// to the correct endpoint querystring param (ie: ?matchFeedbackId=1&matchFeedbackId=2)
	Set<Long> matchFeedbackId
) {

	@RecordBuilder
	public record ProfileFilter(
		String employeeName,
		// Note: this field is intentionally /singular/ so that it will map
		// to the correct endpoint querystring param (ie: ?wfaStatusId=1&wfaStatusId=2)
		Set<Long> wfaStatusId
	) {}

}
