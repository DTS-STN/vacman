package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
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
	protected Instant effectiveDate;

	@Column(name = "[EXPIRY_DATE]")
	protected Instant expiryDate;

	@Column(length = 20, nullable = false)
	protected String code;

	@Column(length = 100, nullable = false)
	protected String nameEn;

	@Column(length = 100, nullable = false)
	protected String nameFr;

	public AbstractCodeEntity() {
		super();
	}

	public AbstractCodeEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate) {
		super();
		this.id = id;
		this.code = code;
		this.nameEn = nameEn;
		this.nameFr = nameFr;
		this.effectiveDate = effectiveDate;
		this.expiryDate = expiryDate;
	}

	public AbstractCodeEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.id = id;
		this.code = code;
		this.nameEn = nameEn;
		this.nameFr = nameFr;
		this.effectiveDate = effectiveDate;
		this.expiryDate = expiryDate;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Instant getEffectiveDate() {
		return effectiveDate;
	}

	public void setEffectiveDate(Instant effectiveDate) {
		this.effectiveDate = effectiveDate;
	}

	public Instant getExpiryDate() {
		return expiryDate;
	}

	public void setExpiryDate(Instant expiryDate) {
		this.expiryDate = expiryDate;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getNameEn() {
		return nameEn;
	}

	public void setNameEn(String nameEn) {
		this.nameEn = nameEn;
	}

	public String getNameFr() {
		return nameFr;
	}

	public void setNameFr(String nameFr) {
		this.nameFr = nameFr;
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
			.append("code", code)
			.append("nameEn", nameEn)
			.append("nameFr", nameFr)
			.append("effectiveDate", effectiveDate)
			.append("expiryDate", expiryDate)
			.append("super", super.toString())
			.toString();
	}

}
