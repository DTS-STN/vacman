package ca.gov.dtsstn.vacman.api.service.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import io.soabase.recordbuilder.core.RecordBuilder;

/**
 * Data Transfer Object (DTO) for profile events.
 */
@RecordBuilder
public record ProfileEventDto(
	Long id,
	String additionalComment,
	Instant createdDate,
	Boolean hasConsentedToPrivacyTerms,
	String hrAdvisorEmail,
	Boolean isAvailableForReferral,
	Boolean isInterestedInAlternation,
	Instant lastModifiedDate,
	String languageOfCorrespondenceCode,
	String personalEmailAddress,
	String profileStatusCode,
	String substantiveCityNameEn,
	String substantiveClassificationNameEn,
	List<String> userEmails,
	String userFirstName,
	String userLanguageCode,
	String userLastName,
	LocalDate wfaEndDate,
	LocalDate wfaStartDate,
	String wfaStatusCode
) {}