package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.core.style.ToStringCreator;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Abstract entity for code/lookup tables with NUMERIC(6) ID constraints.
 * Maximum ID value: 999,999
 * Includes common effective/expiry date fields for all code tables.
 */
@MappedSuperclass
@EntityListeners({ AuditingEntityListener.class })
public abstract class AbstractCodeEntity extends AbstractAuditableEntity {

	public static final long MAX_CODE_ID = 999_999L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false, updatable = false)
	@Min(value = 1, message = "ID must be positive")
	@Max(value = MAX_CODE_ID, message = "ID cannot exceed " + MAX_CODE_ID)
	protected Long id;

	@Column(name = "[EFFECTIVE_DATE]", nullable = false)
	@NotNull(message = "Effective date is required")
	protected LocalDateTime effectiveDate;

	@Column(name = "[EXPIRY_DATE]")
	protected LocalDateTime expiryDate;

	public AbstractCodeEntity() {}

	public AbstractCodeEntity(
			@Nullable Long id,
			@Nonnull LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.id = id;
		if (effectiveDate == null) {
			throw new IllegalArgumentException("Effective date cannot be null");
		}
		this.effectiveDate = effectiveDate;
		this.expiryDate = expiryDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		if (id != null && id > MAX_CODE_ID) {
			throw new IllegalArgumentException("ID cannot exceed " + MAX_CODE_ID);
		}
		this.id = id;
	}

	public LocalDateTime getEffectiveDate() {
		return effectiveDate;
	}

	public void setEffectiveDate(LocalDateTime effectiveDate) {
		if (effectiveDate == null) {
			throw new IllegalArgumentException("Effective date cannot be null");
		}
		this.effectiveDate = effectiveDate;
	}

	public LocalDateTime getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(LocalDateTime expiryDate) {
		this.expiryDate = expiryDate;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) { return true; }
		if (obj == null) { return false; }
		if (getClass() != obj.getClass()) { return false; }

		final var other = (AbstractCodeEntity) obj;
		return Objects.equals(id, other.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("id", id)
			.append("effectiveDate", effectiveDate)
			.append("expiryDate", expiryDate)
			.append("createdBy", createdBy)
			.append("createdDate", createdDate)
			.append("lastModifiedBy", lastModifiedBy)
			.append("lastModifiedDate", lastModifiedDate)
			.toString();
	}

}
