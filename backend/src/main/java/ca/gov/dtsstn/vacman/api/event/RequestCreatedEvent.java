package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request is created.
 */
@RecordBuilder
public record RequestCreatedEvent(RequestEntity entity, Instant timestamp) {

	public RequestCreatedEvent(RequestEntity entity) {
		this(entity, Instant.now());
	}

}
