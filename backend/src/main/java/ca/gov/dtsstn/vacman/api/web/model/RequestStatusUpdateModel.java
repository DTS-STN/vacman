package ca.gov.dtsstn.vacman.api.web.model;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@RecordBuilder
@Schema(name = "RequestStatusUpdate")
public record RequestStatusUpdateModel(
	@NotNull
	@Pattern(
		regexp = "requestSubmitted|requestPickedUp|vmsNotRequired|submitFeedback|matchApproved|pscNotRequired|pscRequired|complete|cancelled",
		message = "Invalid event type"
	)
	@Schema(description = "The event type that triggered the status change", allowableValues = {"requestSubmitted", "requestPickedUp", "vmsNotRequired", "submitFeedback", "matchApproved", "pscNotRequired", "pscRequired", "complete", "cancelled"})
	String eventType
) {}
