package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;
import java.util.Arrays;
import java.util.function.Predicate;

import org.hibernate.annotations.Immutable;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

@Immutable
@MappedSuperclass
public abstract class AbstractCodeEntity extends AbstractBaseEntity {

	/**
	 * Returns a predicate that can be used to filter collections by code.
	 */
	public static <T extends AbstractCodeEntity> Predicate<T> byCode(String... codes) {
		return entity -> Arrays.asList(codes).contains(entity.getCode());
	}

	@Column(name = "[CODE]", length = 20, nullable = false)
	protected String code;

	@Column(name = "[EFFECTIVE_DATE]", nullable = false)
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
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable Instant effectiveDate,
			@Nullable Instant expiryDate,
			@Nullable String createdBy,
			@Nullable Instant createdDate,
			@Nullable String lastModifiedBy,
			@Nullable Instant lastModifiedDate) {
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
