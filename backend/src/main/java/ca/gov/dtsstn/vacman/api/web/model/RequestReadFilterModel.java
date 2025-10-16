package ca.gov.dtsstn.vacman.api.web.model;

import ca.gov.dtsstn.vacman.api.web.validator.ValidHrAdvisorParam;
import io.swagger.v3.oas.annotations.media.Schema;

public record RequestReadFilterModel(
	@ValidHrAdvisorParam
	@Schema(description = "Filter by HR advisor ID")
	String hrAdvisorId
) {}
