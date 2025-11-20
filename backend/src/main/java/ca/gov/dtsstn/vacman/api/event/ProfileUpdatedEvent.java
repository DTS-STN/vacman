package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.service.dto.ProfileEventDto;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is updated. If just the status is updated, ProfileStatusChangeEvent event should be published.
 */
@RecordBuilder
public record ProfileUpdatedEvent(ProfileEventDto dto, Instant timestamp) {

	public ProfileUpdatedEvent(ProfileEventDto dto) {
		this(dto, Instant.now());
	}

}