package ca.gov.dtsstn.vacman.api.web.model;

import org.immutables.value.Value.Immutable;

import tools.jackson.databind.annotation.JsonDeserialize;

@Immutable
@JsonDeserialize(as = ImmutableWfaStatusReadModel.class)
public interface WfaStatusReadModel extends CodeReadModel {}
