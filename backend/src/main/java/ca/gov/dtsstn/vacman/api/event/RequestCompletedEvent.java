package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request is completed (PSC clearance granted).
 */
@RecordBuilder
public record RequestCompletedEvent(RequestEntity entity, Instant timestamp) {

	public RequestCompletedEvent(RequestEntity entity) {
		this(entity, Instant.now());
	}

}
