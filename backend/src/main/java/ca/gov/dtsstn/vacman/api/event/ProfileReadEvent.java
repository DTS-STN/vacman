package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;
import java.util.List;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is read (by Entra ID).
 */
@RecordBuilder
public record ProfileReadEvent(List<ProfileEntity> entities, String entraId, Boolean isActive, Instant timestamp) {

	public ProfileReadEvent(List<ProfileEntity> entities, String entraId, Boolean isActive) {
		this(entities, entraId, isActive, Instant.now());
	}

}