package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;
import java.util.Set;

import io.swagger.v3.oas.annotations.media.Schema;

public record ProfileReadModel(
		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The unique identifier for this profile.", example = "1")
		Long id,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The user associated with this profile")
		UserReadModel profileUser,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The unique identifier for the HR advisor associated with this profile.", example = "2")
		Long hrAdvisorId,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The personal phone number of this profile.", example = "5550-000-1234")
		String personalPhoneNumber,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The personal email of this profile.", example = "john.doe@example.com")
		String personalEmailAddress,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The city associated with the user associated with this profile.")
		CityReadModel substantiveCity,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The language associated with the user associated with this profile.")
		LanguageReadModel languageOfCorrespondence,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The classification of this profile.")
		ClassificationReadModel substantiveClassification,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The work unit of this profile.")
		WorkUnitReadModel substantiveWorkUnit,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The status of this profile.")
		ProfileStatusReadModel profileStatus,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The WFA status of this profile.")
		WfaStatusReadModel wfaStatus,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The start date of the WFA.")
		Instant wfaStartDate,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The end date of the WFA.")
		Instant wfaEndDate,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "Is this profile available for referral?")
		Boolean isAvailableForReferral,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "Is this profile available for alternation?", example = "true")
		Boolean isInterestedInAlternation,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "Has the user of this profile consented to the privacy policy?", example = "true")
		Boolean hasConsentedToPrivacyTerms,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The profiles preferred cities for employment.")
		Set<CityReadModel> preferredCities,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The profiles preferred classifications for employment.")
		Set<ClassificationReadModel> preferredClassifications,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The profiles preferred opportunities for employment.")
		Set<EmploymentOpportunityReadModel> preferredEmploymentOpportunities,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The profiles preferred languages for employment.")
		Set<LanguageReferralTypeReadModel> preferredLanguages,

		@Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "Additional comments on this profile.", example = "One cool individual.")
		String additionalComment,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The user or service that created this user.", example = "vacman-api")
		String createdBy,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The time this user was created.", example = "2000-01-01T00:00:00Z")
		Instant createdDate,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The user or service that last modified this user.", example = "vacman-api")
		String lastModifiedBy,

		@Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The time this user was last modified.", example = "2000-01-01T00:00:00Z")
		Instant lastModifiedDate
		) {

	public record UserModel(
			Long id,
			String firstName,
			String lastName,
			String emailAddress
	) {}
}
