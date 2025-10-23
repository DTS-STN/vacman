package ca.gov.dtsstn.vacman.api.web.model;

import io.soabase.recordbuilder.core.RecordBuilder;
import io.swagger.v3.oas.annotations.media.Schema;

@RecordBuilder
@Schema(name = "ProfileStatusUpdate", description = "Profile Status representation for updating targeted profiles.")
public record ProfileStatusUpdateModel(
	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY, examples = { "PENDING", "APPROVED" })
	String code
) {

	public static ProfileStatusUpdateModelBuilder builder() {
		return ProfileStatusUpdateModelBuilder.builder();
	}

}
