package ca.gov.dtsstn.vacman.api.web.model;

import org.immutables.value.Value.Immutable;

import tools.jackson.databind.annotation.JsonDeserialize;

@Immutable
@JsonDeserialize(as = ImmutablePriorityLevelReadModel.class)
public interface PriorityLevelReadModel extends CodeReadModel {}
