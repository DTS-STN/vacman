package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is created.
 */
@RecordBuilder
public record ProfileCreateEvent(ProfileEntity entity, Instant timestamp) {

	public ProfileCreateEvent(ProfileEntity entity) {
		this(entity, Instant.now());
	}

}