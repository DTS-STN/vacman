package ca.gov.dtsstn.vacman.api.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "Event", description = "Event model")
public record EventReadModel(
    @Schema(description = "Event ID", example = "123")
    @JsonProperty("id")
    Long id,

    @Schema(description = "Event name", example = "Interview Scheduled")
    @JsonProperty("eventName")
    String eventName,

    @Schema(description = "Event description", example = "Technical interview with the hiring manager")
    @JsonProperty("eventDescription")
    String eventDescription,

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
