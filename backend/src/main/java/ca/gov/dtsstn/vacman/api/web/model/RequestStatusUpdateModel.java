package ca.gov.dtsstn.vacman.api.web.model;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@RecordBuilder
@Schema(name = "RequestStatusUpdate")
public record RequestStatusUpdateModel(
	@NotNull
	@Schema(description = "The event type that triggered the status change",
	allowableValues = {"requestSubmitted", "requestPickedUp"})
	String eventType
) {}