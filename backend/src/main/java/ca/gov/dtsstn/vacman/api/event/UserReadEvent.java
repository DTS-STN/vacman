package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a user is read.
 */
@RecordBuilder
public record UserReadEvent(Long userId, Instant timestamp) {

	public UserReadEvent(Long userId) {
		this(userId, Instant.now());
	}

}
