package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;
import java.util.List;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile is read (by Entra ID).
 */
@RecordBuilder
public record ProfileReadEvent(List<Long> profileIds, String entraId, Instant timestamp) {

	public ProfileReadEvent(List<Long> profileIds, String entraId) {
		this(profileIds, entraId, Instant.now());
	}

}
