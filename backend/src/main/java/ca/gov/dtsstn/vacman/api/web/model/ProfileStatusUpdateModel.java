package ca.gov.dtsstn.vacman.api.web.model;

import org.immutables.value.Value.Immutable;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ProfileStatusUpdate", description = "Profile Status representation for updating targeted profiles.")
@Immutable
@JsonDeserialize(as = ImmutableProfileStatusUpdateModel.class)
public interface ProfileStatusUpdateModel {

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY, examples = { "PENDING", "APPROVED" })
	String getCode();

}
