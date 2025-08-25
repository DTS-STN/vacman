package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;
import jakarta.annotation.Nullable;

public interface CodeReadModel {

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable Long getId();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable String getCode();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable String getNameEn();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable String getNameFr();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable Instant getEffectiveDate();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable Instant getExpiryDate();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable String getCreatedBy();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable Instant getCreatedDate();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable String getLastModifiedBy();

	@Schema(accessMode = AccessMode.READ_ONLY)
	@Nullable Instant getLastModifiedDate();

}
