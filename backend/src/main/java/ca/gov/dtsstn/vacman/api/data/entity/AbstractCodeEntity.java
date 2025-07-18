package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotNull;

/**
 * Abstract entity for code/lookup tables.
 * Includes common effective/expiry date fields for all code tables.
 */
@MappedSuperclass
public abstract class AbstractCodeEntity extends AbstractAuditableEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false, updatable = false)
	protected Long id;

	@Column(name = "[EFFECTIVE_DATE]", nullable = false)
	@NotNull(message = "Effective date is required")
	protected LocalDateTime effectiveDate;

	@Column(name = "[EXPIRY_DATE]")
	protected LocalDateTime expiryDate;

	public AbstractCodeEntity() {
		super();
	}

	public AbstractCodeEntity(
			@Nullable Long id,
			@Nullable LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate) {
		super();
		this.id = id;
		this.effectiveDate = effectiveDate;
		this.expiryDate = expiryDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDateTime getEffectiveDate() {
		return effectiveDate;
	}

	public void setEffectiveDate(LocalDateTime effectiveDate) {
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
			.append("super", super.toString())
			.toString();
	}

}
