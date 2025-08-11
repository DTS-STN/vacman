
package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.immutables.value.Value.Immutable;

@Immutable
@JsonDeserialize(as = ImmutableClassificationReadModel.class)
public interface ClassificationReadModel extends CodeReadModel {}
