package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Set;

@Schema(name = "ProfilePutModel")
public record ProfilePutModel (
        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The unique identifier for the HR advisor associated with this profile.", example = "2")
        Long hrAdvisorId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The personal phone number of this profile.", example = "555-123-4567")
        String personalPhoneNumber,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The personal email of this profile.", example = "john.doe@example.com")
        String personalEmailAddress,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The language associated with the user associated with this profile.", example = "1")
        Long languageOfCorrespondenceId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The classification of this profile.", example = "1")
        Long classificationId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The city of this profile.", example = "1")
        Long cityId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The work unit of this profile.", example = "1")
        Long workUnitId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The WFA status of this profile.", example = "1")
        Long wfaStatusId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Is this profile available for referral?")
        Boolean isAvailableForReferral,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Is this profile available for alternation?", example = "true")
        Boolean isInterestedInAlternation,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Has this profile consented to privacy terms?", example = "true")
        Boolean hasConsentedToPrivacyTerms,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Additional comments on this profile.", example = "One cool individual.")
        String additionalComment,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Collection of cities designated as work locations")
        Set<Long> preferredCities,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Collection of cities designated as work locations")
        Set<Long> preferredClassification,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Collection of cities designated as work locations")
        Set<Long> preferredEmploymentOpportunities,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Collection of cities designated as work locations")
        Set<Long> preferredLanguages
) {}
