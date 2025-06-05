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
@Table(name = "[EVENTS]")
@AttributeOverride(name = "id", column = @Column(name = "[EVENT_ID]"))
public class EventEntity extends AbstractEntity {

	@Column(name = "[EVENT_DESCRIPTION]", length = 4000, nullable = false)
	private String payload;

	@Column(name = "[EVENT_NAME]", length = 255, nullable = false)
	private String type;

	public EventEntity() {
		super();
	}

	@Builder.Constructor
	public EventEntity(
			@Nullable Long id,
			@Nullable String payload,
			@Nullable String type,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.payload = payload;
		this.type = type;
	}

	public String getPayload() {
		return payload;
	}

	public void setPayload(String payload) {
		this.payload = payload;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("payload", payload)
			.append("type", type)
			.toString();
	}

}
