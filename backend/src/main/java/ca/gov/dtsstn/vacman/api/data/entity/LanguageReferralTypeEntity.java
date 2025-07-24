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

@Entity(name = "LanguageReferralType")
@AttributeOverride(name = "id", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_ID]"))
@AttributeOverride(name = "code", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_CODE]"))
@AttributeOverride(name = "nameEn", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_NAME_EN]"))
@AttributeOverride(name = "nameFr", column = @Column(name = "[LANGUAGE_REFERRAL_TYPE_NAME_FR]"))
@Table(name = "[CD_LANGUAGE_REFERRAL_TYPE]", uniqueConstraints = { @UniqueConstraint(name = "LNGRFRTYP_UK", columnNames = "[LANGUAGE_REFERRAL_TYPE_NAME_EN]") })
public class LanguageReferralTypeEntity extends AbstractCodeEntity {

	public LanguageReferralTypeEntity() {
		super();
	}

	@Builder.Constructor
	public LanguageReferralTypeEntity(
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
