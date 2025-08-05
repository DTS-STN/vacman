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
@AttributeOverride(name = "id", column = @Column(name = "[EVENT_ID]"))
public class EventEntity extends AbstractBaseEntity {

	@Column(name = "[EVENT_DESCRIPTION]", length = 4000)
	private String description;

	@Column(name = "[EVENT_NAME]", nullable = false, length = 255)
	private String name;

	public EventEntity() {
		super();
	}

	@Builder.Constructor
	public EventEntity(
			@Nullable Long id,
			@Nullable String description,
			@Nullable String name,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.description = description;
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String eventDescription) {
		this.description = eventDescription;
	}

	public String getName() {
		return name;
	}

	public void setName(String eventName) {
		this.name = eventName;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("description", description)
			.append("name", name)
			.toString();
	}

}
