package ca.gov.dtsstn.vacman.api.event;

import java.time.Instant;

import ca.gov.dtsstn.vacman.api.data.entity.RequestEntity;
import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Event that is published when a request is submitted.
 */
@RecordBuilder
public record RequestSubmittedEvent(RequestEntity entity, String previousStatusCode, String newStatusCode, Instant timestamp) {

    public RequestSubmittedEvent(RequestEntity entity, String previousStatusCode, String newStatusCode) {
        this(entity, previousStatusCode, newStatusCode, Instant.now());
    }

}