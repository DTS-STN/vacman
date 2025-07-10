package ca.gov.dtsstn.vacman.api.web.model;

import java.time.Instant;

import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.Schema.AccessMode;

@Schema(name = "NotificationPurposeRead", description = "Standard representation of a notification purpose.")
public record NotificationPurposeReadModel(
    @Schema(accessMode = AccessMode.READ_ONLY, description = "The unique identifier for this notification purpose.")
    Long id,

    @Schema(description = "The code of this notification purpose.", example = "EMAIL_NOTIFICATION")
    String code,

    @Schema(description = "The English name of this notification purpose.", example = "Email Notification")
    String nameEn,

    @Schema(description = "The French name of this notification purpose.", example = "Notification par courriel")
    String nameFr,

    @Schema(description = "The GC Notify template ID for this notification purpose.", example = "550e8400-e29b-41d4-a716-446655440000")
    String gcNotifyTemplateId,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that created this notification purpose.", example = "vacman-api")
    String createdBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this notification purpose was created.", example = "2000-01-01T00:00:00Z")
    Instant createdDate,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The user or service that last modified this notification purpose.", example = "vacman-api")
    String lastModifiedBy,

    @Schema(accessMode = AccessMode.READ_ONLY, description = "The time this notification purpose was last modified.", example = "2000-01-01T00:00:00Z")
    Instant lastModifiedDate
) {}
