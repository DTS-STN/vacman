package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Profile", description = "Profile model")
public record ProfileReadModel(
    @Schema(description = "Profile ID", example = "123")
    @JsonProperty("id")
    Long id,

    @Schema(description = "User ID", example = "456")
    @JsonProperty("userId")
    Long userId,

    @Schema(description = "Approved by user ID", example = "789")
    @JsonProperty("approvedByUserId")
    Long approvedByUserId,

    @Schema(description = "Reviewed by user ID", example = "321")
    @JsonProperty("reviewedByUserId")
    Long reviewedByUserId,

    @Schema(description = "City code", example = "OTT")
    @JsonProperty("cityCode")
    String cityCode,

    @Schema(description = "Classification code", example = "CS-02")
    @JsonProperty("classificationCode")
    String classificationCode,

    @Schema(description = "Additional comment", example = "Interested in remote work")
    @JsonProperty("comment")
    String comment,

    @Schema(description = "Education level code", example = "BACH")
    @JsonProperty("educationLevelCode")
    String educationLevelCode,

    @Schema(description = "Privacy consent indicator", example = "true")
    @JsonProperty("hasAcceptedPrivacyTerms")
    Boolean hasAcceptedPrivacyTerms,

    @Schema(description = "Available for referral indicator", example = "true")
    @JsonProperty("isAvailableForReferral")
    Boolean isAvailableForReferral,

    @Schema(description = "Interested in alternation indicator", example = "false")
    @JsonProperty("isInterestedInAlternation")
    Boolean isInterestedInAlternation,

    @Schema(description = "Language code", example = "EN")
    @JsonProperty("languageCode")
    String languageCode,

    @Schema(description = "Personal email address", example = "john.doe@example.com")
    @JsonProperty("personalEmailAddress")
    String personalEmailAddress,

    @Schema(description = "Personal phone number", example = "613-555-1234")
    @JsonProperty("personalPhoneNumber")
    String personalPhoneNumber,

    @Schema(description = "Priority level code", example = "HIGH")
    @JsonProperty("priorityLevelCode")
    String priorityLevelCode,

    @Schema(description = "Profile status code", example = "ACTIVE")
    @JsonProperty("profileStatusCode")
    String profileStatusCode,

    @Schema(description = "WFA status code", example = "APPROVED")
    @JsonProperty("wfaStatusCode")
    String wfaStatusCode,

    @Schema(description = "Work unit code", example = "ITSB")
    @JsonProperty("workUnitCode")
    String workUnitCode,

    @Schema(description = "Created date", example = "2024-01-15T10:30:00Z")
    @JsonProperty("createdDate")
    String createdDate,

    @Schema(description = "Created by", example = "system")
    @JsonProperty("createdBy")
    String createdBy,

    @Schema(description = "Last modified date", example = "2024-01-20T14:45:00Z")
    @JsonProperty("lastModifiedDate")
    String lastModifiedDate,

    @Schema(description = "Last modified by", example = "admin")
    @JsonProperty("lastModifiedBy")
    String lastModifiedBy
) {}
