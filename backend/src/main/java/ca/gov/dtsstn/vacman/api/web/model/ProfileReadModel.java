package ca.gov.dtsstn.vacman.api.web.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

public record ProfileReadModel(
        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The unique identifier for this profile.", example = "1")
        Long id,

        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The unique identifier for the user associated with this profile.", example = "2")
        Long userId,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The unique identifier for the HR advisor associated with this profile.", example = "2")
        Long hrAdvisorId,

        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The Microsoft Entra ID of the user associated with this profile.", example = "00000000-0000-0000-0000-000000000000")
        String microsoftEntraId,

        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The first name of the user associated with this profile..", example = "John")
        String firstName,

        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The last name of the user associated with this profile.", example = "Doe")
        String lastName,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The personal email of this profile.", example = "john.doe@example.com")
        String personalEmailAddress,

        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The language associated with the user associated with this profile.")
        LanguageReadModel language,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The classification of this profile.")
        ClassificationReadModel classification,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The priority of this profile.")
        PriorityLevelReadModel priorityLevel,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The work unit of this profile.")
        WorkUnitReadModel workUnit,

        @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "The status of this profile.")
        ProfileStatusReadModel profileStatus,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "The WFA status of this profile.")
        WfaStatusReadModel wfaStatus,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "Is this profile available for referral?")
        Boolean isAvailableForReferral,

        @Schema(accessMode = Schema.AccessMode.READ_WRITE, description = "Is this profile available for alternation?", example = "true")
        Boolean isInterestedInAlternation,

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
) {}
