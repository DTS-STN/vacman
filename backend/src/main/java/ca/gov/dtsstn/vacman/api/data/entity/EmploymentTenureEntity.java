package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.LocalDateTime;

import org.immutables.builder.Builder;
import org.springframework.core.style.ToStringCreator;

import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "EmploymentTenure")
@Table(name = "[CD_EMPLOYMENT_TENURE]", uniqueConstraints = {
    @UniqueConstraint(name = "EMPTNR_UK", columnNames = "[EMPLOYMENT_TENURE_NAME_EN]")
})
@AttributeOverride(name = "id", column = @Column(name = "[EMPLOYMENT_TENURE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[EMPLOYMENT_TENURE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[EMPLOYMENT_TENURE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[EMPLOYMENT_TENURE_NAME_FR]"))
public class EmploymentTenureEntity extends AbstractLookupEntity {

	public EmploymentTenureEntity() {
		super();
	}

	@Builder.Constructor
	public EmploymentTenureEntity(
			@Nullable Long id,
			@Nullable String code,
			@Nullable String nameEn,
			@Nullable String nameFr,
			@Nonnull LocalDateTime effectiveDate,
			@Nullable LocalDateTime expiryDate) {
		super(id, code, nameEn, nameFr, effectiveDate, expiryDate);
	}

	@Override
	public String toString() {
		return new ToStringCreator(this)
			.append("super", super.toString())
			.toString();
	}

}
