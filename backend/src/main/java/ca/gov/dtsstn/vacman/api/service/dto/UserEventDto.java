package ca.gov.dtsstn.vacman.api.service.dto;

import java.time.Instant;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Data Transfer Object (DTO) for user events.
 */
@RecordBuilder
public record UserEventDto(
	Long id,
	String businessEmailAddress,
	Instant createdDate,
	String firstName,
	String languageCode,
	Instant lastModifiedDate,
	String lastName,
	String microsoftEntraId,
	String userTypeCode
) {}
