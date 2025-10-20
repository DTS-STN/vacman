package ca.gov.dtsstn.vacman.api.web.model;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

/**
 * Model for updating a match.
 */
@RecordBuilder
@Schema(name = "MatchUpdate")
public record MatchUpdateModel(
	@Schema(description = "The ID of the match feedback.")
	Long matchFeedbackId,

	@Schema(description = "Comment from the hiring manager.")
	@Size(max = 2000)
	String hiringManagerComment,

	@Schema(description = "Comment from the HR advisor.")
	@Size(max = 2000)
	String hrAdvisorComment
) {}
