package ca.gov.dtsstn.vacman.api.data.entity;

import java.time.Instant;

import org.immutables.builder.Builder;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity(name = "LanguageRequirement")
@Table(name = "[CD_LANGUAGE_REQUIREMENT]")
public class LanguageRequirementEntity extends AbstractCodeEntity {

	public static LanguageRequirementEntityBuilder builder() {
		return new LanguageRequirementEntityBuilder();
	}

	public LanguageRequirementEntity() {
		super();
	}

	@Builder.Constructor
	public LanguageRequirementEntity(
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

}
