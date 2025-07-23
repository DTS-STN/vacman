package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotNull;

@MappedSuperclass
public abstract class AbstractCodeEntity extends AbstractBaseEntity {

	@Column(name = "[CODE]", length = 20, nullable = false)
	protected String code;

	@Column(name = "[EFFECTIVE_DATE]", nullable = false)
	@NotNull(message = "Effective date is required")
	protected Instant effectiveDate;

	@Column(name = "[EXPIRY_DATE]")
	protected Instant expiryDate;

	@Column(name = "[NAME_EN]", length = 100, nullable = false)
	protected String nameEn;

	@Column(name = "[NAME_FR]", length = 100, nullable = false)
	protected String nameFr;

	public AbstractCodeEntity() {
		super();
	}

	public AbstractCodeEntity(
			@Nullable Long id,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.code = code;
		this.effectiveDate = effectiveDate;
		this.expiryDate = expiryDate;
		this.nameEn = nameEn;
		this.nameFr = nameFr;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
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
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("code", code)
			.append("nameEn", nameEn)
			.append("nameFr", nameFr)
			.append("effectiveDate", effectiveDate)
			.append("expiryDate", expiryDate)
			.toString();
	}

}
