package ca.gov.dtsstn.vacman.api.service.dto;

import io.soabase.recordbuilder.core.RecordBuilder;

import java.util.List;

@RecordBuilder
public record MSGraphUserCollection(
        List<MSGraphUser> value
) {}
