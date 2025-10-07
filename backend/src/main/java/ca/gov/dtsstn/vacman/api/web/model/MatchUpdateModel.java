package ca.gov.dtsstn.vacman.api.web.model;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import ca.gov.dtsstn.vacman.api.web.validator.ValidMatchStatusCode;
import ca.gov.dtsstn.vacman.api.web.validator.ValidMatchFeedbackCode;

/**
 * Update model for matches.
 */
@RecordBuilder
@Schema(name = "MatchUpdate")
public record MatchUpdateModel(
	@NotNull
	@Schema(description = "The ID of the profile associated with this match.", example = "1")
	Long profileId,

	@NotNull
	@Schema(description = "The ID of the request associated with this match.", example = "1")
	Long requestId,

	@NotNull
	@ValidMatchStatusCode
	@Schema(description = "The ID of the status for this match.", example = "1")
	Long matchStatusId,

	@ValidMatchFeedbackCode
	@Schema(description = "The ID of the feedback for this match.", example = "1")
	Long matchFeedbackId,

	@Size(max = 100)
	@Schema(description = "Comment from the hiring manager.", example = "Candidate meets all requirements.")
	String hiringManagerComment,

	@Size(max = 100)
	@Schema(description = "Comment from the HR advisor.", example = "Candidate meets all requirements.")
	String hrAdvisorComment
) {}
