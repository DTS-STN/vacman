package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;
import java.time.LocalDate;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Lightweight read model for matches with nested records for related entities.
 */
@RecordBuilder
@Schema(name = "MatchSummary")
public record MatchSummaryReadModel(
		@Schema(description = "The unique identifier for this match.")
		Long id,

		@Schema(description = "The profile summary for this match.")
		ProfileSummary profile,

		@Schema(description = "The request summary for this match.")
		RequestSummary request,

		@Schema(description = "The status of this match.")
		CodeSummary matchStatus,

		@Schema(description = "The feedback for this match.")
		CodeSummary matchFeedback,

		@Schema(description = "Comment from the hiring manager.")
		String hiringManagerComment,

		@Schema(description = "Comment from the HR advisor.")
		String hrAdvisorComment,

		@Schema(description = "The time this match was created.")
		Instant createdDate
) {
	@RecordBuilder
	public record ProfileSummary(
			Long id,
			String firstName,
			String lastName,
			CodeSummary wfaStatus
	) {}

	@RecordBuilder
	public record RequestSummary(
			Long id,
			CodeSummary requestStatus,
			Instant requestDate,
			String hiringManagerFirstName,
			String hiringManagerLastName,
			String hiringManagerEmail,
			Long hrAdvisorId,
			String hrAdvisorFirstName,
			String hrAdvisorLastName,
			String hrAdvisorEmail
	) {}

	@RecordBuilder
	public record CodeSummary(
			Long id,
			String code,
			String nameEn,
			String nameFr
	) {}
}