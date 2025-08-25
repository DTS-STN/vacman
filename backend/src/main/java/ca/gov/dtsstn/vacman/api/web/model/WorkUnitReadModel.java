package ca.gov.dtsstn.vacman.api.web.model;

import org.immutables.value.Value.Immutable;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;

@Immutable
@JsonDeserialize(as = ImmutableWorkUnitReadModel.class)
public interface WorkUnitReadModel extends CodeReadModel {
	@Nullable
	@Schema(accessMode = Schema.AccessMode.READ_ONLY, nullable = true)
	WorkUnitReadModel getParent();
}
