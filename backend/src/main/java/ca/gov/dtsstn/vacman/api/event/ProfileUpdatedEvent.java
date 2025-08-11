package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is updated. If just the status is updated, ProfileStatusChangeEvent event should be published.
 */
@RecordBuilder
public record ProfileUpdatedEvent(ProfileEntity entity, Instant timestamp) {

	public ProfileUpdatedEvent(ProfileEntity entity) {
		this(entity, Instant.now());
	}

}