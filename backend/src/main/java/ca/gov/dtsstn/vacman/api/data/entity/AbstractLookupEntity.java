package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.time.LocalDateTime;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class AbstractLookupEntity extends AbstractEntity {

	@Column(length = 20, nullable = false, unique = true)
	protected String code;

	@Column(length = 100, nullable = false, unique = true)
	protected String nameEn;

	@Column(length = 100, nullable = false, unique = true)
	protected String nameFr;

	@Column(name = "EFFECTIVE_DATE", nullable = false)
	protected LocalDateTime effectiveDate;

	@Column(name = "EXPIRY_DATE", nullable = true)
	protected LocalDateTime expiryDate;

	public AbstractLookupEntity() {
		super();
	}

	public AbstractLookupEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
		super(id, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
		this.code = code;
		this.nameEn = nameEn;
		this.nameFr = nameFr;
		this.effectiveDate = effectiveDate;
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
