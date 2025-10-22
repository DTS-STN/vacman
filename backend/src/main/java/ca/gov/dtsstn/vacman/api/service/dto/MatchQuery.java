package ca.gov.dtsstn.vacman.api.service.dto;

import io.soabase.recordbuilder.core.RecordBuilder;

@RecordBuilder
public record MatchQuery(
    Long profileId,
    Long requestId
) {}
