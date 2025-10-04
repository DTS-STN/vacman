package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when feedback is pending on a request.
 */
@RecordBuilder
public record RequestFeedbackPendingEvent(RequestEntity entity, Instant timestamp) {

	public RequestFeedbackPendingEvent(RequestEntity entity) {
		this(entity, Instant.now());
	}

}
