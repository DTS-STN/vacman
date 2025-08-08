package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when the current user is read via the /users/me endpoint.
 */
@RecordBuilder
public record CurrentUserReadEvent(Long userId, String microsoftEntraId, Instant timestamp) {

	public CurrentUserReadEvent(Long userId, String microsoftEntraId) {
		this(userId, microsoftEntraId, Instant.now());
	}

}