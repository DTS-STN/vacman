package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.ProfileEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is created.
 */
@RecordBuilder
public record ProfileCreateEvent(ProfileEventDto dto, Instant timestamp) {

	public ProfileCreateEvent(ProfileEventDto dto) {
		this(dto, Instant.now());
	}

}