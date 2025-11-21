
package ca.gov.dtsstn.vacman.api.web.model;

import org.immutables.value.Value.Immutable;

import tools.jackson.databind.annotation.JsonDeserialize;

@Immutable
@JsonDeserialize(as = ImmutableClassificationReadModel.class)
public interface ClassificationReadModel extends CodeReadModel {}
