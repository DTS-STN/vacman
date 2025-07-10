package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "Event")
@Table(name = "[EVENT]")
@AttributeOverride(name = "id", column = @Column(name = "[EVENT_ID]", columnDefinition = "NUMERIC(10) IDENTITY NOT FOR REPLICATION"))
@AttributeOverride(name = "createdDate", column = @Column(name = "[DATE_CREATED]", nullable = false, updatable = false, columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"))
public class EventEntity extends AbstractEntity {

	@Column(name = "[EVENT_DESCRIPTION]", length = 4000, nullable = true)
	private String eventDescription;

	@Column(name = "[EVENT_NAME]", length = 255, nullable = false)
	private String eventName;

	public EventEntity() {
		super();
	}

	@Builder.Constructor
	public EventEntity(
			@Nullable Long id,
			@Nullable String eventDescription,
			@Nullable String eventName,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.eventDescription = eventDescription;
		this.eventName = eventName;
	}

	public String getEventDescription() {
		return eventDescription;
	}

	public void setEventDescription(String eventDescription) {
		this.eventDescription = eventDescription;
	}

	public String getEventName() {
		return eventName;
	}

	public void setEventName(String eventName) {
		this.eventName = eventName;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("eventDescription", eventDescription)
			.append("eventName", eventName)
			.toString();
	}

}
