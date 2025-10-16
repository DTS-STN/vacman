package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidHrAdvisorParam;
import io.swagger.v3.oas.annotations.media.Schema;

public record RequestReadFilterModel(
	@ValidHrAdvisorParam
	@Schema(description = "Filter by HR advisor ID. Accepted values: 'me' (to refer to the current user) or a numeric ID (e.g., '12345').")
	String hrAdvisorId
) {}
