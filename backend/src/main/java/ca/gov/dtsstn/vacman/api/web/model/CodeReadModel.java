package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

public interface CodeReadModel {

	@Schema(accessMode = AccessMode.READ_ONLY)
	Long getId();

	@Schema(accessMode = AccessMode.READ_ONLY)
	String getCode();

	@Schema(accessMode = AccessMode.READ_ONLY)
	String getNameEn();

	@Schema(accessMode = AccessMode.READ_ONLY)
	String getNameFr();

	@Schema(accessMode = AccessMode.READ_ONLY)
	String getCreatedBy();

	@Schema(accessMode = AccessMode.READ_ONLY)
	Instant getCreatedDate();

	@Schema(accessMode = AccessMode.READ_ONLY)
	String getLastModifiedBy();

	@Schema(accessMode = AccessMode.READ_ONLY)
	Instant getLastModifiedDate();

}
