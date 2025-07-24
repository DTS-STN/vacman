package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "EmploymentEquity")
@AttributeOverride(name = "id", column = @Column(name = "[EMPLOYMENT_EQUITY_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[EMPLOYMENT_EQUITY_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EMPLOYMENT_EQUITY_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EMPLOYMENT_EQUITY_NAME_FR]"))
@Table(name = "[CD_EMPLOYMENT_EQUITY]", uniqueConstraints = { @UniqueConstraint(name = "EMPLYMNTEQT_UK", columnNames = "[EMPLOYMENT_EQUITY_NAME_EN]") })
public class EmploymentEquityEntity extends AbstractCodeEntity {

	public EmploymentEquityEntity() {
		super();
	}

	@Builder.Constructor
	public EmploymentEquityEntity(
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
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate, createdBy, createdDate, lastModifiedBy, lastModifiedDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
