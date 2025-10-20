package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile's status is changed.
 */
@RecordBuilder
public record ProfileStatusChangeEvent(ProfileEntity entity, Long previousStatusId, Long newStatusId, Instant timestamp) {

	public ProfileStatusChangeEvent(ProfileEntity entity, Long previousStatusId, Long newStatusId) {
		this(entity, previousStatusId, newStatusId, Instant.now());
	}

}
