package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.RequestEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published whenever a request's HR advisor assignment changes.
 */
@RecordBuilder
public record RequestHrAdvisorUpdatedEvent(
	RequestEventDto dto,
	Long previousHrAdvisorId,
	Long newHrAdvisorId,
	Instant timestamp) {

	public RequestHrAdvisorUpdatedEvent(RequestEventDto dto, Long previousHrAdvisorId, Long newHrAdvisorId) {
		this(dto, previousHrAdvisorId, newHrAdvisorId, Instant.now());
	}

}
