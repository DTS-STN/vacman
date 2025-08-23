package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "Event")
@Table(name = "[EVENT]")
public class EventEntity extends AbstractBaseEntity {

	@Column(name = "[TYPE]", nullable = false, length = 255)
	private String type;

	@Column(name = "[DETAIL]", length = 4000)
	private String details;

	public EventEntity() {
		super();
	}

	@Builder.Constructor
	public EventEntity(
			@Nullable Long id,
			@Nullable String type,
			@Nullable String details,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.type = type;
		this.details = details;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDetails() {
		return details;
	}

	public void setDetails(String details) {
		this.details = details;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("type", type)
			.append("details", details)
			.toString();
	}

}
