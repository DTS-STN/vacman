package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when feedback is completed on a request.
 */
@RecordBuilder
public record RequestFeedbackCompletedEvent(RequestEventDto dto, Instant timestamp) {

	public RequestFeedbackCompletedEvent(RequestEventDto dto) {
		this(dto, Instant.now());
	}

}
