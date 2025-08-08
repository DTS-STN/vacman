package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.ProfileEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a profile's state is changed
 * TODO: emit this event when the PUT /profiles/{id}/state endpoint is implemented.
 */
@RecordBuilder
public record ProfileStateChangeEvent(ProfileEntity entity, String previousState, String newState, Instant timestamp) {

    public ProfileStateChangeEvent(ProfileEntity entity, String previousState, String newState) {
        this(entity, previousState, newState, Instant.now());
    }

}