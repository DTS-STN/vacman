package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "EVENT")
public class EventEntity extends AbstractBaseEntity {

    @Column(name = "EVENT_NAME", nullable = false, length = 255)
    private String eventName;

    @Column(name = "EVENT_DESCRIPTION", length = 4000)
    private String eventDescription;

    @Column(name = "EVENT_DETAILS", length = 4000)
    private String eventDetails;

    public EventEntity() {
        super();
    }

    @Builder.Constructor
    public EventEntity(
            @Nullable Long id,
            @Nullable String eventName,
            @Nullable String eventDescription,
            @Nullable String eventDetails,
            @Nullable String createdBy,
            @Nullable Instant createdDate,
            @Nullable String lastModifiedBy,
            @Nullable Instant lastModifiedDate) {
        super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
        this.eventName = eventName;
        this.eventDescription = eventDescription;
        this.eventDetails = eventDetails;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventDescription() {
        return eventDescription;
    }

    public void setEventDescription(String eventDescription) {
        this.eventDescription = eventDescription;
    }

    public String getEventDetails() {
        return eventDetails;
    }

    public void setEventDetails(String eventDetails) {
        this.eventDetails = eventDetails;
    }

    @Override
    public String toString() {
        return new ToStringCreator(this)
            .append("super", super.toString())
            .append("eventName", eventName)
            .append("eventDescription", eventDescription)
            .append("eventDetails", eventDetails)
            .toString();
    }
}
