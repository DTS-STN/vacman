package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.MatchEntity;

/**
 * Event that is published when a match's status is changed.
 */
public record MatchStatusChangeEvent(MatchEntity entity, String previousStatusCode, String newStatusCode, Instant timestamp) {

    public MatchStatusChangeEvent(MatchEntity entity, String previousStatusCode, String newStatusCode) {
        this(entity, previousStatusCode, newStatusCode, Instant.now());
    }

}