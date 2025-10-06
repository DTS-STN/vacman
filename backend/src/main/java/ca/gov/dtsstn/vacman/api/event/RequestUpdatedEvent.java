package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request is updated.
 */
@RecordBuilder
public record RequestUpdatedEvent(RequestEntity entity, Instant timestamp) {

	public RequestUpdatedEvent(RequestEntity entity) {
		this(entity, Instant.now());
	}

}
