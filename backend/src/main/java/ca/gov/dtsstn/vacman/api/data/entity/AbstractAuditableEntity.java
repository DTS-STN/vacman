package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.springframework.core.style.ToStringCreator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;

/**
 * Abstract base entity providing audit fields for all entities.
 * This contains the common audit fields without ID field.
 */
@MappedSuperclass
@EntityListeners({ AuditingEntityListener.class })
public abstract class AbstractAuditableEntity {

	@CreatedBy
	@Column(name = "[USER_CREATED]", length = 50, nullable = false, updatable = false)
	protected String createdBy;

	@CreatedDate
	@Column(name = "[DATE_CREATED]", nullable = false, updatable = false)
	protected Instant createdDate;

	@LastModifiedBy
	@Column(name = "[USER_UPDATED]", length = 50)
	protected String lastModifiedBy;

	@Version
	@LastModifiedDate
	@Column(name = "[DATE_UPDATED]")
	protected Instant lastModifiedDate;

	public AbstractAuditableEntity() {}

	public AbstractAuditableEntity(
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		this.createdBy = createdBy;
		this.createdDate = createdDate;
		this.lastModifiedBy = lastModifiedBy;
		this.lastModifiedDate = lastModifiedDate;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Instant getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Instant createdDate) {
		this.createdDate = createdDate;
	}

	public String getLastModifiedBy() {
		return lastModifiedBy;
	}

	public void setLastModifiedBy(String lastModifiedBy) {
		this.lastModifiedBy = lastModifiedBy;
	}

	public Instant getLastModifiedDate() {
		return lastModifiedDate;
	}

	public void setLastModifiedDate(Instant lastModifiedDate) {
		this.lastModifiedDate = lastModifiedDate;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("createdBy", createdBy)
			.append("createdDate", createdDate)
			.append("lastModifiedBy", lastModifiedBy)
			.append("lastModifiedDate", lastModifiedDate)
			.toString();
	}

}
