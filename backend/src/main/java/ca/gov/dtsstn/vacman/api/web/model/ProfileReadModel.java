package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "Profile", description = "Profile model")
public record ProfileReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this profile.")
    @JsonProperty("id")
    Long id,

    @Schema(description = "The user associated with this profile.")
    @JsonProperty("user")
    UserReadModel user,

    @Schema(description = "The HR advisor associated with this profile.")
    @JsonProperty("hrAdvisor")
    UserReadModel hrAdvisor,

    @Schema(description = "The WFA status of this profile.")
    @JsonProperty("wfaStatus")
    WfaStatusReadModel wfaStatus,

    @Schema(description = "The classification of this profile.")
    @JsonProperty("classification")
    ClassificationReadModel classification,

    @Schema(description = "The city associated with this profile.")
    @JsonProperty("city")
    CityReadModel city,

    @Schema(description = "The priority level of this profile.")
    @JsonProperty("priorityLevel")
    PriorityLevelReadModel priorityLevel,

    @Schema(description = "The work unit associated with this profile.")
    @JsonProperty("workUnit")
    WorkUnitReadModel workUnit,

    @Schema(description = "The language associated with this profile.")
    @JsonProperty("language")
    LanguageReadModel language,

    @Schema(description = "The status of this profile.")
    @JsonProperty("profileStatus")
    ProfileStatusReadModel profileStatus,

    @Schema(description = "Personal phone number", example = "613-555-1234")
    @JsonProperty("personalPhoneNumber")
    String personalPhoneNumber,

    @Schema(description = "Personal email address", example = "john.doe@example.com")
    @JsonProperty("personalEmailAddress")
    String personalEmailAddress,

    @Schema(description = "Privacy consent indicator", example = "true")
    @JsonProperty("privacyConsentInd")
    Boolean privacyConsentInd,

    @Schema(description = "Available for referral indicator", example = "true")
    @JsonProperty("availableForReferralInd")
    Boolean availableForReferralInd,

    @Schema(description = "Interested in alternation indicator", example = "false")
    @JsonProperty("interestedInAlternationInd")
    Boolean interestedInAlternationInd,

    @Schema(description = "Additional comment", example = "Interested in remote work")
    @JsonProperty("additionalComment")
    String additionalComment,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this profile.", example = "vacman-api")
    @JsonProperty("createdBy")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this profile was created.", example = "2000-01-01T00:00:00Z")
    @JsonProperty("createdDate")
    String createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this profile.", example = "vacman-api")
    @JsonProperty("lastModifiedBy")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this profile was last modified.", example = "2000-01-01T00:00:00Z")
    @JsonProperty("lastModifiedDate")
    String lastModifiedDate
) {}
