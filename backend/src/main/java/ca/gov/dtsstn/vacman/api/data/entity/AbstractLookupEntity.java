package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.LocalDateTime;

import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass
public abstract class AbstractLookupEntity extends AbstractCodeEntity {

	@Column(length = 20, nullable = false)
	protected String code;

	@Column(length = 100, nullable = false)
	protected String nameEn;

	@Column(length = 100, nullable = false)
	protected String nameFr;

	public AbstractLookupEntity() {
		super();
	}

	public AbstractLookupEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nullable LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate) {
		super(id, effectiveDate, expiryDate);
		this.code = code;
		this.nameEn = nameEn;
		this.nameFr = nameFr;
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
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.append("code", code)
			.append("nameEn", nameEn)
			.append("nameFr", nameFr)
			.toString();
	}

}
