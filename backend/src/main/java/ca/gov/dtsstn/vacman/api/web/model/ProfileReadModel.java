package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Profile", description = "Profile model aligned with DDL PROFILE table structure")
public record ProfileReadModel(
    @Schema(description = "Profile ID", example = "123")
    @JsonProperty("id")
    Long id,

    @Schema(description = "User ID", example = "456")
    @JsonProperty("userId")
    Long userId,

    @Schema(description = "HR Advisor User ID", example = "789")
    @JsonProperty("hrAdvisorUserId")
    Long hrAdvisorUserId,

    @Schema(description = "WFA status code", example = "APPROVED")
    @JsonProperty("wfaStatusCode")
    String wfaStatusCode,

    @Schema(description = "Classification code", example = "CS-02")
    @JsonProperty("classificationCode")
    String classificationCode,

    @Schema(description = "City code", example = "OTT")
    @JsonProperty("cityCode")
    String cityCode,

    @Schema(description = "Priority level code", example = "HIGH")
    @JsonProperty("priorityLevelCode")
    String priorityLevelCode,

    @Schema(description = "Work unit code", example = "ITSB")
    @JsonProperty("workUnitCode")
    String workUnitCode,

    @Schema(description = "Language ID", example = "1")
    @JsonProperty("languageId")
    Long languageId,

    @Schema(description = "Profile status code", example = "ACTIVE")
    @JsonProperty("profileStatusCode")
    String profileStatusCode,

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
