package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidMatchStatusCode;
import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@RecordBuilder
@Schema(name = "MatchStatusUpdate")
public record MatchStatusUpdateModel(
	@NotNull
	@ValidMatchStatusCode
	@Schema(description = "The status code to set the match to", allowableValues = { "IP-EC", "PA-EAA", "A-A" })
	String statusCode
) {}
