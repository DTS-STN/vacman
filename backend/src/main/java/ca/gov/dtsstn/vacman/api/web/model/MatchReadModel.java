package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Read model for matches.
 */
@RecordBuilder
@Schema(name = "MatchRead")
public record MatchReadModel(
	@Schema(description = "The profile associated with this match.")
	ProfileReadModel profile,

	@Schema(description = "The request associated with this match.")
	RequestReadModel request,

	@Schema(description = "The status of this match.")
	MatchStatusReadModel matchStatus,

	@Schema(description = "The feedback for this match.")
	MatchFeedbackReadModel matchFeedback,

	@Schema(description = "Comment from the hiring manager.", example = "Candidate meets all requirements.")
	String hiringManagerComment,

	@Schema(description = "Comment from the HR advisor.", example = "Candidate meets all requirements.")
	String hrAdvisorComment,

	//
	// tombstone fields
	//

	@Schema(description = "The unique identifier for this match.", example = "1")
	Long id,

	@Schema(description = "The user or service that created this match.", example = "vacman-api")
	String createdBy,

	@Schema(description = "The time this match was created.", example = "2000-01-01T00:00:00Z")
	Instant createdDate,

	@Schema(description = "The user or service that last modified this match.", example = "vacman-api")
	String lastModifiedBy,

	@Schema(description = "The time this match was last modified.", example = "2000-01-01T00:00:00Z")
	Instant lastModifiedDate
) {}
