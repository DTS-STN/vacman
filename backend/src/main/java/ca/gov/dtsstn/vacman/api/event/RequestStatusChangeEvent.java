package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request's status is changed.
 */
@RecordBuilder
public record RequestStatusChangeEvent(RequestEntity entity, String previousStatusCode, String newStatusCode, Instant timestamp) {

	public RequestStatusChangeEvent(RequestEntity entity, String previousStatusCode, String newStatusCode) {
		this(entity, previousStatusCode, newStatusCode, Instant.now());
	}

}
