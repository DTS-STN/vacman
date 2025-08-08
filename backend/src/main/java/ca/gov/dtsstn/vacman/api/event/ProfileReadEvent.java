package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;
import java.util.List;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is read (by Entra ID).
 */
@RecordBuilder
public record ProfileReadEvent(List<Long> profileIds, String entraId, Boolean isActive, Instant timestamp) {

	public ProfileReadEvent(List<Long> profileIds, String entraId, Boolean isActive) {
		this(profileIds, entraId, isActive, Instant.now());
	}

}
