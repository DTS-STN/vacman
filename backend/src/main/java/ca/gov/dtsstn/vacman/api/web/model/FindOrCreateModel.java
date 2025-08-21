package ca.gov.dtsstn.vacman.api.web.model;


import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import io.swagger.v3.oas.annotations.media.Schema;
import org.immutables.value.Value.Immutable;

@Immutable
@JsonDeserialize(as = ImmutableFindOrCreateModel.class)
public interface FindOrCreateModel {

    @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The business email address of the associated individual.")
    String getBusinessEmail();
}
