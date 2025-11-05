package ca.gov.dtsstn.vacman.api.service.dto;

import java.util.Set;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
public record MatchQuery(
	Long profileId,
	Long requestId,
	Set<Long> matchFeedbackIds,
	String profileEmployeeName,
	Set<Long> profileWfaStatusIds
) {

	public static MatchQueryBuilder builder() {
		return MatchQueryBuilder.builder();
	}

}
