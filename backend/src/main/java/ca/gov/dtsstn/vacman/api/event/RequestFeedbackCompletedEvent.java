package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when feedback is completed on a request.
 */
@RecordBuilder
public record RequestFeedbackCompletedEvent(RequestEntity entity, Instant timestamp) {

	public RequestFeedbackCompletedEvent(RequestEntity entity) {
		this(entity, Instant.now());
	}

}
