package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.immutables.value.Value.Immutable;

@Immutable
@JsonDeserialize(as = ImmutableWfaStatusReadModel.class)
public interface WfaStatusReadModel extends CodeReadModel {}
