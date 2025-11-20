package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.ProfileEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile's status is changed.
 */
@RecordBuilder
public record ProfileStatusChangeEvent(ProfileEventDto dto, Long previousStatusId, Long newStatusId, Instant timestamp) {

	public ProfileStatusChangeEvent(ProfileEventDto dto, Long previousStatusId, Long newStatusId) {
		this(dto, previousStatusId, newStatusId, Instant.now());
	}

}
