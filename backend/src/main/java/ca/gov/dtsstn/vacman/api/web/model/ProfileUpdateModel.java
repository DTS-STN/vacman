package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;

public record ProfileUpdateModel (
        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The unique identifier for the HR advisor associated with this profile.", example = "2")
        Long hrAdvisorId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The personal email of this profile.", example = "john.doe@example.com")
        String personalEmailAddress,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The ID of the classification of this profile.")
        Long classificationId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The ID of the priority of this profile.")
        Long priorityLevelId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The ID of the work unit of this profile.")
        Long workUnitId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The ID of the status of this profile.")
        Long profileStatusId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "The ID of the WFA status of this profile.")
        Long wfaStatusId,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Is this profile available for referral?")
        Boolean isAvailableForReferral,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Is this profile available for alternation?", example = "true")
        Boolean isInterestedInAlternation,

        @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, description = "Additional comments on this profile.", example = "One cool individual.")
        String additionalComment
) {}
