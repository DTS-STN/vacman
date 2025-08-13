package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import org.immutables.value.Value.Immutable;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ProfileStatusUpdate", description = "Profile Status representation for updating targeted profiles.")
@Immutable
@JsonDeserialize(as = ImmutableProfileStatusUpdateModel.class)
public interface ProfileStatusUpdateModel {

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	Long getId();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	String getCode();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	String getNameEn();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	String getNameFr();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	String getCreatedBy();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	Instant getCreatedDate();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	String getLastModifiedBy();

	@Schema(accessMode = Schema.AccessMode.WRITE_ONLY)
	Instant getLastModifiedDate();

}
